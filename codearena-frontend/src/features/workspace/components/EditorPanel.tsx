import { memo, useCallback, useEffect, useState } from "react"
import Editor from "@monaco-editor/react"
import { RotateCcw, Play } from "lucide-react"
import { useSubmission } from "../hooks/useSubmission"

interface EditorPanelProps {
  problemId: string
}

const STORAGE_KEY = (id: string) => `codearena_function_draft_${id}`

const DEFAULT_CODE = `function solution(a, b) {
  return a + b;
}
`

// Memoized Monaco Editor to prevent expensive re-renders
const MonacoEditor = memo(({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Editor
    height="100%"
    language="javascript"
    theme="vs-dark"
    value={value}
    onChange={(v) => onChange(v || "")}
    options={{
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      lineHeight: 24,
      padding: { top: 16 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      formatOnPaste: true,
    }}
  />
))
MonacoEditor.displayName = "MonacoEditor"

export default function EditorPanel({ problemId }: EditorPanelProps) {
  return <EditorPanelContent key={problemId} problemId={problemId} />
}

function EditorPanelContent({ problemId }: EditorPanelProps) {
  // Autosave: restore draft from localStorage per problem
  const [code, setCode] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY(problemId)) || DEFAULT_CODE
  })

  const { submit, isSubmitting } = useSubmission()

  // Autosave code drafts with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY(problemId), code)
    }, 500)
    return () => clearTimeout(timeout)
  }, [code, problemId])

  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY(problemId))
    setCode(DEFAULT_CODE)
  }, [problemId])

  const handleRunCode = useCallback(() => {
    submit({ problemId, code, language: "javascript" })
  }, [submit, problemId, code])

  const handleCodeChange = useCallback((v: string) => setCode(v), [])

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-10 border-b border-border/40 flex items-center px-4 bg-[#1e1e1e] shrink-0 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium bg-surface-glass px-2 py-1 rounded">
            JavaScript
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            title="Reset code"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={handleRunCode}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded transition-colors"
          >
            <Play className="h-3.5 w-3.5" />
            {isSubmitting ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <MonacoEditor value={code} onChange={handleCodeChange} />
      </div>
    </div>
  )
}
