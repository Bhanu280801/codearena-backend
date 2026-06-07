import { api } from "../../../lib/axios"
import type { SubmissionResult, SubmissionStatus } from "../types/submission"

export interface SubmitPayload {
  problemId: string
  code: string
  language: string
}

interface RawSubmission {
  id?: string | number
  submissionId?: string | number
  status?: string
  verdict?: string | null
  runtime?: string
  memory?: string
  language?: string
  sourceCode?: string
  createdAt?: string
  passedTestCases?: number | null
  totalTestCases?: number | null
  errorMessage?: string
  message?: string
  testResults?: SubmissionResult["testResults"]
}

export const submissionsApi = {
  submit: async (payload: SubmitPayload): Promise<{ submissionId: string }> => {
    const response = await api.post("/submissions", {
      problemId: payload.problemId,
      sourceCode: payload.code,
      language: normalizeLanguage(payload.language),
    })

    return {
      submissionId: String(response.data.submission?.id ?? response.data.submissionId),
    }
  },

  getStatus: async (submissionId: string): Promise<SubmissionResult> => {
    const response = await api.get(`/submissions/${submissionId}`)
    return normalizeSubmission(response.data)
  },

  getByProblem: async (problemId: string): Promise<SubmissionResult[]> => {
    const response = await api.get(`/submissions/problem/${problemId}`)
    return response.data.map(normalizeSubmission)
  }
}

function normalizeLanguage(language: string) {
  if (language === "typescript") return "javascript"
  return language
}

function normalizeSubmission(submission: RawSubmission): SubmissionResult {
  const status = normalizeStatus(submission.status, submission.verdict)
  const parsedFailure = parseFailureDetails(submission.errorMessage)

  return {
    submissionId: String(submission.id ?? submission.submissionId),
    status,
    verdict: submission.verdict,
    language: submission.language,
    sourceCode: submission.sourceCode,
    createdAt: submission.createdAt,
    runtime: submission.runtime,
    memory: submission.memory,
    passedTestCases: submission.passedTestCases,
    totalTestCases: submission.totalTestCases,
    errorMessage: parsedFailure ? undefined : submission.errorMessage,
    message: submission.message,
    testResults: parsedFailure
      ? [{ ...parsedFailure, passed: false, time: submission.runtime, memory: submission.memory }]
      : submission.testResults,
  }
}

function parseFailureDetails(errorMessage?: string) {
  if (!errorMessage) {
    return null
  }

  try {
    const parsed = JSON.parse(errorMessage)

    if (parsed?.type !== "failed_test_case") {
      return null
    }

    return {
      input: parsed.input || "",
      expectedOutput: parsed.expectedOutput || "",
      actualOutput: parsed.actualOutput || "",
    }
  } catch {
    return null
  }
}

function normalizeStatus(status?: string, verdict?: string | null): SubmissionStatus {
  if (status === "pending") return "queued"
  if (status === "processing") return "processing"

  const normalizedVerdict = String(verdict || status || "")
    .toLowerCase()
    .replace(/\s+/g, "_") as SubmissionStatus

  if (
    [
      "accepted",
      "wrong_answer",
      "runtime_error",
      "time_limit_exceeded",
      "compilation_error",
      "system_error",
    ].includes(normalizedVerdict)
  ) {
    return normalizedVerdict
  }

  return "system_error"
}
