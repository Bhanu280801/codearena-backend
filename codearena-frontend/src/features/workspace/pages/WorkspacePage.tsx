import { lazy, Suspense } from "react"
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels"
import ProblemPanel from "../components/ProblemPanel"
import ConsolePanel from "../components/ConsolePanel"
import { motion } from "framer-motion"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useProblem } from "../hooks/useProblem"
import { useAuthStore } from "../../../store/auth.store"

const EditorPanel = lazy(() => import("../components/EditorPanel"))

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>()

  const problemId = id || "1"
  const { data: problem } = useProblem(problemId)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen w-full flex flex-col overflow-hidden bg-background"
    >
      {/* Top Navbar Placeholder */}
      <header className="h-14 border-b border-border bg-surface-primary flex items-center px-4 shrink-0">
        <Link className="font-bold futuristic-gradient-text mr-6" to="/problems">CodeArena</Link>
        <div className="text-sm text-muted-foreground flex-1">
          {problem?.title || "Loading problem..."}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user?.role === "ADMIN" && (
            <Link className="text-primary hover:underline" to="/admin/problems">
              Admin
            </Link>
          )}
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            Logout
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup orientation="horizontal" className="h-full rounded-xl overflow-hidden border border-border bg-surface-primary shadow-2xl">
          {/* Left: Problem Statement */}
          <Panel defaultSize={40} minSize={25}>
            <ProblemPanel problemId={problemId} />
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors cursor-col-resize relative">
            <div className="absolute inset-y-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-8 w-1 rounded-full bg-muted-foreground/30" />
          </PanelResizeHandle>

          {/* Right: Editor & Console */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup orientation="vertical">
              <Panel defaultSize={70} minSize={30}>
                <Suspense fallback={<div className="h-full bg-[#1e1e1e]" />}>
                  <EditorPanel problemId={problemId} />
                </Suspense>
              </Panel>
              
              <PanelResizeHandle className="h-1.5 bg-border hover:bg-primary/50 transition-colors cursor-row-resize relative">
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-1 rounded-full bg-muted-foreground/30" />
              </PanelResizeHandle>

              <Panel defaultSize={30} minSize={15}>
                <ConsolePanel problemId={problemId} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </motion.div>
  )
}
