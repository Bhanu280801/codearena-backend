export type SubmissionStatus =
  | "idle"
  | "queued"
  | "processing"
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "time_limit_exceeded"
  | "compilation_error"
  | "system_error"

export interface TestCaseResult {
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  time?: string
  memory?: string
}

export interface SubmissionResult {
  submissionId: string
  status: SubmissionStatus
  verdict?: string | null
  language?: string
  sourceCode?: string
  createdAt?: string
  message?: string
  runtime?: string
  memory?: string
  passedTestCases?: number | null
  totalTestCases?: number | null
  testResults?: TestCaseResult[]
  errorMessage?: string
}

export interface SubmissionState {
  status: SubmissionStatus
  result: SubmissionResult | null
}
