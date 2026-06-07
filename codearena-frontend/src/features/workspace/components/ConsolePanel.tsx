import { useState } from "react"
import type { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSubmissionStore } from "../store/submission.store"
import type { SubmissionStatus, TestCaseResult } from "../types/submission"
import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { useProblem } from "../hooks/useProblem"

const statusConfig: Record<SubmissionStatus, { label: string; color: string; icon: ReactNode }> = {
  idle: { label: "Ready", color: "text-muted-foreground", icon: null },
  queued: {
    label: "Queued",
    color: "text-yellow-400",
    icon: <Clock className="h-4 w-4" />,
  },
  processing: {
    label: "Running...",
    color: "text-blue-400",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  accepted: {
    label: "Accepted",
    color: "text-green-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  wrong_answer: {
    label: "Wrong Answer",
    color: "text-red-400",
    icon: <XCircle className="h-4 w-4" />,
  },
  runtime_error: {
    label: "Runtime Error",
    color: "text-orange-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  time_limit_exceeded: {
    label: "Time Limit Exceeded",
    color: "text-orange-400",
    icon: <Clock className="h-4 w-4" />,
  },
  compilation_error: {
    label: "Compilation Error",
    color: "text-red-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  system_error: {
    label: "System Error",
    color: "text-red-400",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
}

function TestCaseCard({ result, index }: { result: TestCaseResult; index: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border rounded-lg overflow-hidden ${
        result.passed ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-400" />
          )}
          Case {index + 1}
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 px-4 py-3 space-y-3 text-xs font-mono"
          >
            <div>
              <div className="text-muted-foreground mb-1">Input</div>
              <div className="bg-background border border-border rounded px-2 py-1.5 text-foreground">{result.input}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Expected</div>
              <div className="bg-background border border-border rounded px-2 py-1.5 text-green-400">{result.expectedOutput}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Got</div>
              <div className={`bg-background border border-border rounded px-2 py-1.5 ${result.passed ? "text-green-400" : "text-red-400"}`}>
                {result.actualOutput}
              </div>
            </div>
            {result.time && (
              <div className="flex items-center gap-4 text-muted-foreground">
                <span><Cpu className="h-3 w-3 inline mr-1" />{result.time} ms</span>
                {result.memory && <span>{result.memory} MB</span>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ConsolePanelProps {
  problemId: string
}

export default function ConsolePanel({ problemId }: ConsolePanelProps) {
  const [activeTab, setActiveTab] = useState<"testcases" | "result">("testcases")
  const { status, result } = useSubmissionStore()
  const { data: problem } = useProblem(problemId)
  const config = statusConfig[status]

  const isActive = status !== "idle"
  const visibleTestCases = problem?.testCases?.filter((testCase) => !testCase.isHidden) || []

  return (
    <div className="h-full flex flex-col bg-surface-primary">
      <div className="h-10 border-b border-border flex items-center px-2 bg-surface-glass shrink-0 justify-between">
        <div className="flex">
          {(["testcases", "result"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "result" ? "Test Result" : "Testcases"}
            </button>
          ))}
        </div>

        {/* Execution status badge */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1.5 text-xs font-medium ${config.color} pr-2`}
          >
            {config.icon}
            {config.label}
          </motion.div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-auto text-sm">
        {activeTab === "testcases" && (
          <div className="space-y-3 text-xs font-mono">
            <div className="text-muted-foreground text-xs mb-3">Sample test cases</div>
            {visibleTestCases.length === 0 && (
              <div className="text-muted-foreground font-sans">
                No public sample cases are available for this problem.
              </div>
            )}
            {visibleTestCases.map((testCase, index) => (
              <div key={`${testCase.input || "empty"}-${index}`} className="space-y-2 rounded-md border border-border bg-background p-3">
                <div className="text-muted-foreground font-sans font-semibold">Case {index + 1}</div>
                <div>
                  <div className="mb-1 text-muted-foreground font-sans">Input</div>
                  <pre className="whitespace-pre-wrap rounded border border-border bg-surface-primary px-3 py-2 text-foreground">
                    {testCase.input || "(empty)"}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 text-muted-foreground font-sans">Expected output</div>
                  <pre className="whitespace-pre-wrap rounded border border-border bg-surface-primary px-3 py-2 text-green-400">
                    {testCase.output || "(empty)"}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "result" && (
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-muted-foreground text-sm"
              >
                Run your code to see results here.
              </motion.div>
            )}

            {(status === "queued" || status === "processing") && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-4"
              >
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{config.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {status === "queued" ? "Waiting for execution slot..." : "Executing your code against test cases..."}
                  </p>
                </div>
              </motion.div>
            )}

            {result && !["queued", "processing"].includes(status) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Summary header */}
                <div className={`flex items-center gap-2 text-sm font-semibold ${config.color}`}>
                  {config.icon}
                  {config.label}
                  {result.totalTestCases != null && (
                    <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {result.passedTestCases ?? 0}/{result.totalTestCases} passed
                    </span>
                  )}
                  {result.runtime && (
                    <span className="ml-auto text-xs text-muted-foreground font-normal">
                      Runtime: {result.runtime} | Memory: {result.memory}
                    </span>
                  )}
                </div>

                {/* Error output */}
                {result.errorMessage && (
                  <pre className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-xs text-red-400 overflow-auto font-mono whitespace-pre-wrap">
                    {result.errorMessage}
                  </pre>
                )}

                {/* Test case results */}
                {result.testResults && result.testResults.length > 0 && (
                  <div className="space-y-2">
                    {result.testResults.map((tc, i) => (
                      <TestCaseCard key={i} result={tc} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
