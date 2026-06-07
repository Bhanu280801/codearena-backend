import { Outlet } from "react-router-dom"
import { CommandPalette } from "../ui/CommandPalette"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CommandPalette />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* We can add a global gradient background here if needed */}
        <Outlet />
      </main>
    </div>
  )
}
