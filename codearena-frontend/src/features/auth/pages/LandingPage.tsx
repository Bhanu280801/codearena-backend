import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* Decorative blurred blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          The Next-Gen <br />
          <span className="futuristic-gradient-text">Coding Workspace</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          An immersive, developer-focused platform to hone your skills, build intuition, and level up your engineering career.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link 
            to="/login"
            className="px-8 py-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Start Coding
          </Link>
          <Link 
            to="/problems"
            className="px-8 py-4 rounded-md glass-panel text-foreground font-medium hover:bg-surface-glass/60 transition-colors"
          >
            Explore Problems
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
