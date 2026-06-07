import * as React from "react"
import { Command } from "cmdk"
import { useNavigate } from "react-router-dom"
import { Moon, Sun, Terminal } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  // Toggle the menu when Ctrl+K or Cmd+K is pressed.
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-24" onClick={() => setOpen(false)}>
      <div 
        className="w-full max-w-lg bg-surface-primary border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full h-full flex flex-col" label="Global Command Menu">
          <Command.Input 
            autoFocus 
            placeholder="Type a command or search..." 
            className="w-full px-4 py-4 bg-transparent border-b border-border text-foreground outline-none text-sm placeholder:text-muted-foreground"
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground px-2 py-1">
              <Command.Item 
                className="flex items-center px-2 py-2 mt-1 text-sm text-foreground rounded-md cursor-pointer hover:bg-surface-glass aria-selected:bg-surface-glass transition-colors"
                onSelect={() => { navigate("/"); setOpen(false) }}
              >
                <Terminal className="mr-2 h-4 w-4" /> Go to Home
              </Command.Item>
              <Command.Item 
                className="flex items-center px-2 py-2 mt-1 text-sm text-foreground rounded-md cursor-pointer hover:bg-surface-glass aria-selected:bg-surface-glass transition-colors"
                onSelect={() => { navigate("/problems/1"); setOpen(false) }}
              >
                <Terminal className="mr-2 h-4 w-4" /> Go to Workspace
              </Command.Item>
              <Command.Item 
                className="flex items-center px-2 py-2 mt-1 text-sm text-foreground rounded-md cursor-pointer hover:bg-surface-glass aria-selected:bg-surface-glass transition-colors"
                onSelect={() => { navigate("/login"); setOpen(false) }}
              >
                <Terminal className="mr-2 h-4 w-4" /> Login
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Theme" className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
              <Command.Item className="flex items-center px-2 py-2 mt-1 text-sm text-foreground rounded-md cursor-pointer hover:bg-surface-glass aria-selected:bg-surface-glass transition-colors">
                <Sun className="mr-2 h-4 w-4" /> Light Mode
              </Command.Item>
              <Command.Item className="flex items-center px-2 py-2 mt-1 text-sm text-foreground rounded-md cursor-pointer hover:bg-surface-glass aria-selected:bg-surface-glass transition-colors">
                <Moon className="mr-2 h-4 w-4" /> Dark Mode
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
