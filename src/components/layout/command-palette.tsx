"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Terminal, 
  Layout, 
  Users, 
  Database, 
  Settings, 
  Shield, 
  Zap,
  Command as CommandIcon,
  X,
  Package,
  FileText,
  DollarSign,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const ACTIONS = [
  { id: "dash", name: "The Bridge", icon: Layout, shortcut: "D", path: "/dashboard" },
  { id: "hub", name: "Neural Analytics Hub", icon: Zap, shortcut: "H", path: "/hub" },
  { id: "spec", name: "Specialist Directory", icon: Users, shortcut: "S", path: "/specialists" },
  { id: "inv", name: "Inventory Matrix", icon: Package, shortcut: "I", path: "/inventory" },
  { id: "rep", name: "Reporting Engine", icon: FileText, shortcut: "R", path: "/reports" },
  { id: "billing", name: "Financial Matrix", icon: DollarSign, shortcut: "F", path: "/billing" },
  { id: "diag", name: "Diagnostic IQ", icon: Activity, shortcut: "Q", path: "/diagnostic-iq" },
  { id: "audit", name: "Compliance Auditor", icon: Shield, shortcut: "A", path: "/compliance" },
  { id: "settings", name: "System Settings", icon: Settings, shortcut: ",", path: "/settings" },
]

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleNavigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
    setQuery("")
  }

  const filteredActions = ACTIONS.filter(action => 
    action.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-xl bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 aeterna-glass"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
              <Search className="h-5 w-5 text-foreground/20" />
              <input 
                autoFocus
                type="text" 
                placeholder="Neural search system..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-foreground placeholder:text-foreground/20 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
                <X className="h-3 w-3 text-foreground/40 cursor-pointer" onClick={() => setIsOpen(false)} />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">
                Quick Navigation
              </div>
              {filteredActions.map((action) => (
                <div 
                  key={action.id}
                  onClick={() => handleNavigate(action.path)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 group cursor-pointer transition-colors"
                >
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all">
                    <action.icon className="h-4 w-4 text-foreground/40 group-hover:text-primary" />
                  </div>
                  <span className="flex-1 font-bold text-foreground/80 group-hover:text-foreground">{action.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-foreground/20 group-hover:text-primary/40 uppercase tracking-tighter">Jump to</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-foreground/40 font-mono">
                      {action.shortcut}
                    </kbd>
                  </div>
                </div>
              ))}
              {filteredActions.length === 0 && (
                <div className="px-8 py-12 text-center flex flex-col items-center gap-4">
                  <Terminal className="h-12 w-12 text-foreground/10" />
                  <p className="text-sm text-foreground/40 italic font-medium">No system modules matching &quot;{query}&quot;</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-foreground/60 font-mono">↑↓</kbd>
                  <span className="text-[10px] text-foreground/40 uppercase font-black tracking-widest">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-foreground/60 font-mono">Enter</kbd>
                  <span className="text-[10px] text-foreground/40 uppercase font-black tracking-widest">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest">System Search Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
