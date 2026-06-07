import { memo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useProblem } from "../hooks/useProblem"
import { submissionsApi } from "../api/submissions"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ProblemPanelProps {
  problemId: string
}

const difficultyConfig = {
  Easy: "bg-green-500/10 text-green-400 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
}

// Skeleton loader to avoid layout shift while loading
function ProblemSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-surface-glass rounded w-2/3" />
      <div className="h-5 bg-surface-glass rounded w-16" />
      <div className="space-y-2 mt-6">
        <div className="h-4 bg-surface-glass rounded w-full" />
        <div className="h-4 bg-surface-glass rounded w-5/6" />
        <div className="h-4 bg-surface-glass rounded w-4/6" />
      </div>
      <div className="h-24 bg-surface-glass rounded mt-6" />
    </div>
  )
}

const MarkdownRenderer = memo(({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "")
        const isInline = !match
        return isInline ? (
          <code className="bg-surface-glass px-1.5 py-0.5 rounded text-primary font-mono text-sm" {...props}>
            {children}
          </code>
        ) : (
          <pre className="bg-background border border-border p-4 rounded-lg overflow-x-auto text-sm my-3">
            <code className={`language-${match[1]}`} {...props}>
              {String(children).replace(/\n$/, "")}
            </code>
          </pre>
        )
      },
      h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 text-foreground">{children}</h1>,
      h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-2 text-foreground">{children}</h2>,
      h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
      p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>,
      strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
      pre: ({ children }) => <>{children}</>,
      table: ({ children }) => (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-border bg-surface-glass px-3 py-2 text-left font-semibold text-foreground">{children}</th>
      ),
      td: ({ children }) => (
        <td className="border border-border px-3 py-2 text-muted-foreground">{children}</td>
      ),
      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-4 text-muted-foreground">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4 text-muted-foreground">{children}</ol>,
      li: ({ children }) => <li className="ml-2">{children}</li>,
    }}
  >
    {content}
  </ReactMarkdown>
))
MarkdownRenderer.displayName = "MarkdownRenderer"

type Tab = "description" | "editorial" | "submissions"

export default function ProblemPanel({ problemId }: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("description")
  const { data: problem, isLoading, isError, error } = useProblem(problemId)
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["submissions", "problem", problemId],
    queryFn: () => submissionsApi.getByProblem(problemId),
    enabled: activeTab === "submissions",
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Description" },
    { key: "editorial", label: "Editorial" },
    { key: "submissions", label: "Submissions" },
  ]

  return (
    <div className="h-full flex flex-col bg-surface-primary">
      {/* Tabs */}
      <div className="h-10 border-b border-border flex items-center px-2 bg-surface-glass shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "description" && (
          <>
            {isLoading && <ProblemSkeleton />}

            {isError && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <p className="text-red-400 font-medium">Failed to load problem</p>
                <p className="text-muted-foreground text-sm">
                  {error instanceof Error ? error.message : "Something went wrong"}
                </p>
              </div>
            )}

            {problem && (
              <div className="prose prose-invert max-w-none">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${difficultyConfig[problem.difficulty as keyof typeof difficultyConfig] || difficultyConfig.Easy}`}>
                    {problem.difficulty}
                  </span>
                  {problem.tags?.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded text-xs font-medium bg-surface-glass text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>

                <MarkdownRenderer content={problem.description} />
              </div>
            )}
          </>
        )}

        {activeTab === "editorial" && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Editorial coming soon.
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="space-y-3">
            {isLoadingSubmissions && (
              <div className="text-sm text-muted-foreground">Loading submissions...</div>
            )}

            {!isLoadingSubmissions && submissions.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Your submission history will appear here.
              </div>
            )}

            {submissions.map((submission) => (
              <div key={submission.submissionId} className="rounded-md border border-border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {(submission.verdict || submission.status).replace(/_/g, " ")}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : "Unknown time"}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{submission.language || "javascript"}</div>
                    <div>
                      {submission.passedTestCases ?? 0}/{submission.totalTestCases ?? 0} passed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
