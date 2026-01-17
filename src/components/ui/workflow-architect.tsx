"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Zap, 
  Cpu, 
  Shield, 
  Activity, 
  Users, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Pause, 
  RotateCcw 
} from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "1", type: "trigger", label: "Volume Spike", icon: Activity, pos: { x: 50, y: 50 } },
  { id: "2", type: "process", label: "Staffing Check", icon: Users, pos: { x: 250, y: 50 } },
  { id: "3", type: "decision", label: "SLA Breach?", icon: Shield, pos: { x: 450, y: 50 } },
  { id: "4", type: "action", label: "Reroute Staff", icon: Zap, pos: { x: 650, y: 50 } },
]

export const WorkflowArchitect: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotate({
      x: (y - centerY) / 20,
      y: (centerX - x) / 20,
    })
  }

  return (
    <div 
      className="relative w-full h-[300px] rounded-3xl overflow-hidden cursor-crosshair group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setRotate({ x: 0, y: 0 })
      }}
      style={{
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: isHovered ? "none" : "all 0.5s ease",
        transformStyle: "preserve-3d"
      }}
    >
      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700" />
      
      {/* Node Grid Background */}
      <div className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)", 
          backgroundSize: "30px 30px" 
        }} 
      />

      {/* Connection Paths (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {STEPS.slice(0, -1).map((step, i) => {
          const next = STEPS[i + 1]
          const isActive = activeStep === i
          return (
            <g key={`path-${i}`}>
              <line
                x1={step.pos.x + 40}
                y1={step.pos.y + 40}
                x2={next.pos.x + 40}
                y2={next.pos.y + 40}
                stroke="currentColor"
                strokeWidth="2"
                className={cn(
                  "transition-all duration-1000",
                  isActive ? "text-primary opacity-100" : "text-white/10 opacity-30"
                )}
              />
              {isActive && (
                <motion.circle
                  r="3"
                  fill="rgb(16, 185, 129)"
                  initial={{ cx: step.pos.x + 40, cy: step.pos.y + 40 }}
                  animate={{ cx: next.pos.x + 40, cy: next.pos.y + 40 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="neural-glow"
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {STEPS.map((step, i) => (
        <motion.div
          key={step.id}
          className={cn(
            "absolute w-20 h-20 rounded-2xl aeterna-glass flex flex-col items-center justify-center gap-2 border transition-all duration-500",
            activeStep === i ? "border-primary/50 bg-primary/10 scale-110 z-20" : "border-white/5 bg-white/5 opacity-60 grayscale"
          )}
          style={{ left: step.pos.x, top: step.pos.y }}
        >
          {activeStep === i && (
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse -z-10" />
          )}
          <step.icon className={cn(
            "h-6 w-6 transition-colors duration-500",
            activeStep === i ? "text-primary" : "text-foreground/40"
          )} />
          <span className="text-[8px] font-black uppercase tracking-tighter text-center px-1">
            {step.label}
          </span>
        </motion.div>
      ))}

      {/* Status Overlay */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Autonomous Cycle Active</span>
        </div>
        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
          Step: {activeStep + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  )
}
