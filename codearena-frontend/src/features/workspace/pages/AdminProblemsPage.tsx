import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { problemsApi } from "../api/problems"
import type { Problem, ProblemPayload } from "../api/problems"
import { useAllProblems } from "../hooks/useProblem"

const emptyPayload: ProblemPayload = {
  title: "",
  slug: "",
  description: "",
  difficulty: "Easy",
  tags: [],
  sampleInput: "[1,2]",
  sampleOutput: "3",
  executionMode: "FUNCTION",
  functionName: "solution",
  inputFormat: "Function arguments are provided from the sample input JSON.",
  outputFormat: "Return the answer from the solution function.",
  testCases: [
    { input: "[1,2]", output: "3", isHidden: false },
    { input: "[10,20]", output: "30", isHidden: true },
  ],
  isPublished: true,
  timeLimitMs: 2000,
  memoryLimitMb: 128,
}

export default function AdminProblemsPage() {
  const queryClient = useQueryClient()
  const { data: problems = [], isLoading } = useAllProblems()
  const [selected, setSelected] = useState<Problem | null>(null)
  const [form, setForm] = useState<ProblemPayload>(emptyPayload)
  const [testCasesText, setTestCasesText] = useState(JSON.stringify(emptyPayload.testCases, null, 2))

  const isEditing = Boolean(selected)

  const sortedProblems = useMemo(
    () => [...problems].sort((a, b) => a.title.localeCompare(b.title)),
    [problems]
  )

  const refreshProblems = async () => {
    await queryClient.invalidateQueries({ queryKey: ["problems"] })
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const testCases = JSON.parse(testCasesText)

      if (!Array.isArray(testCases)) {
        throw new Error("Test cases must be a JSON array.")
      }

      const payload = {
        ...form,
        tags: form.tags.filter(Boolean),
        testCases,
        executionMode: "FUNCTION" as const,
        functionName: form.functionName || "solution",
      }

      return selected
        ? problemsApi.update(selected.id, payload)
        : problemsApi.create(payload)
    },
    onSuccess: async (data) => {
      toast.success(data.message)
      setSelected(data.problem)
      setForm(problemToForm(data.problem))
      setTestCasesText(JSON.stringify(data.problem.testCases || [], null, 2))
      await refreshProblems()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => problemsApi.remove(id),
    onSuccess: async (data) => {
      toast.success(data.message)
      handleNew()
      await refreshProblems()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSelect = (problem: Problem) => {
    setSelected(problem)
    setForm(problemToForm(problem))
    setTestCasesText(JSON.stringify(problem.testCases || [], null, 2))
  }

  const handleNew = () => {
    setSelected(null)
    setForm(emptyPayload)
    setTestCasesText(JSON.stringify(emptyPayload.testCases, null, 2))
  }

  const updateForm = (key: keyof ProblemPayload, value: unknown) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-md border border-border bg-surface-primary">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h1 className="text-xl font-semibold">Problems</h1>
              <p className="text-sm text-muted-foreground">Admin management</p>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-surface-glass"
              title="New problem"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-auto p-2">
            {isLoading && (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading problems...
              </div>
            )}

            {sortedProblems.map((problem) => (
              <button
                key={problem.id}
                onClick={() => handleSelect(problem)}
                className={`mb-2 w-full rounded-md border p-3 text-left transition-colors ${
                  selected?.id === problem.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{problem.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{problem.slug}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-border bg-surface-primary">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-xl font-semibold">{isEditing ? "Edit Problem" : "New Problem"}</h2>
              <p className="text-sm text-muted-foreground">All problems use function-style judging.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-glass" to="/problems">
                View list
              </Link>
              {selected && (
                <button
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <Field label="Title" value={form.title} onChange={(value) => updateForm("title", value)} />
            <Field label="Slug" value={form.slug} onChange={(value) => updateForm("slug", value)} />
            <Field label="Difficulty" value={form.difficulty} onChange={(value) => updateForm("difficulty", value)} />
            <Field
              label="Tags"
              value={form.tags.join(", ")}
              onChange={(value) => updateForm("tags", value.split(",").map((tag) => tag.trim()))}
            />
            <Field label="Function Name" value={form.functionName || "solution"} onChange={(value) => updateForm("functionName", value)} />
            <Field label="Sample Input" value={form.sampleInput || ""} onChange={(value) => updateForm("sampleInput", value)} />
            <Field label="Sample Output" value={form.sampleOutput || ""} onChange={(value) => updateForm("sampleOutput", value)} />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={Boolean(form.isPublished)}
                onChange={(event) => updateForm("isPublished", event.target.checked)}
              />
              Published
            </label>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                className="min-h-40 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-muted-foreground">Test Cases JSON</span>
              <textarea
                value={testCasesText}
                onChange={(event) => setTestCasesText(event.target.value)}
                className="min-h-56 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  )
}

function problemToForm(problem: Problem): ProblemPayload {
  return {
    title: problem.title,
    slug: problem.slug,
    description: problem.description,
    difficulty: problem.difficulty,
    constraints: problem.constraints || null,
    inputFormat: problem.inputFormat || "Function arguments are provided from the sample input JSON.",
    outputFormat: problem.outputFormat || "Return the answer from the solution function.",
    sampleInput: problem.sampleInput || "",
    sampleOutput: problem.sampleOutput || "",
    tags: problem.tags || [],
    testCases: problem.testCases || [],
    executionMode: "FUNCTION",
    functionName: problem.functionName || "solution",
    isPublished: problem.isPublished ?? true,
    timeLimitMs: problem.timeLimitMs || 2000,
    memoryLimitMb: problem.memoryLimitMb || 128,
  }
}
