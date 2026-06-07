import { Link, useNavigate } from "react-router-dom"
import { Loader2, LogOut, Shield } from "lucide-react"
import { useAllProblems } from "../hooks/useProblem"
import { useAuthStore } from "../../../store/auth.store"

const difficultyConfig = {
  Easy: "border-green-500/20 bg-green-500/10 text-green-400",
  Medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  Hard: "border-red-500/20 bg-red-500/10 text-red-400",
}

export default function ProblemsPage() {
  const { data: problems = [], isLoading, isError, error } = useAllProblems()
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a challenge and jump into the workspace.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "ADMIN" && (
              <Link
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-surface-glass"
                to="/admin/problems"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-surface-glass"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link className="text-sm text-primary hover:underline" to="/login">
                Login
              </Link>
            )}
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading problems...
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            {(error as Error)?.message || "Failed to load problems."}
          </div>
        )}

        {!isLoading && !isError && problems.length === 0 && (
          <div className="rounded-md border border-border bg-surface-primary p-6 text-sm text-muted-foreground">
            No published problems are available yet.
          </div>
        )}

        <div className="grid gap-3">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problems/${problem.id}`}
              className="group rounded-md border border-border bg-surface-primary p-4 transition-colors hover:border-primary/60"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold group-hover:text-primary">{problem.title}</h2>
                <span
                  className={`rounded border px-2 py-0.5 text-xs font-medium ${
                    difficultyConfig[problem.difficulty as keyof typeof difficultyConfig] || difficultyConfig.Easy
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>
              {problem.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border bg-surface-glass px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
