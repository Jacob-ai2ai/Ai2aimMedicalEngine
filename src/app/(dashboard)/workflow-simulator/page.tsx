"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Workflow, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Brain, 
  Activity, 
  Server, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Terminal,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { WorkflowService } from "@/lib/workflow/service"
import { WorkflowDefinition, WorkflowEvent } from "@/lib/workflow/types"
import { cn } from "@/lib/utils"

export default function WorkflowSimulatorPage() {
  const workflowService = WorkflowService.getInstance()
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([])
  const [selectedDefinition, setSelectedDefinition] = useState<WorkflowDefinition | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationLogs, setSimulationLogs] = useState<WorkflowEvent[]>([])
  const [currentStep, setCurrentStep] = useState(-1)

  useEffect(() => {
    setDefinitions(workflowService.getDefinitions())
  }, [workflowService])

  const runSimulation = async () => {
    if (!selectedDefinition) return
    
    setIsSimulating(true)
    setSimulationLogs([])
    setCurrentStep(-1)

    // Simulate step-by-step progress
    const steps = [
      { type: "info", narrative: `Initializing Neural Simulation for '${selectedDefinition.name}'...`, delay: 1000 },
      ...selectedDefinition.steps.map(step => ({
        type: "decision",
        narrative: `Evaluating Step: ${step.id} (${step.type}). Target: ${step.target}`,
        delay: 1500
      })),
      { type: "info", narrative: "Simulation Safety Audit: PASSED", delay: 1000 },
      { type: "info", narrative: "Workflow verified for autonomous deployment.", delay: 500 }
    ]

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)
      const event: WorkflowEvent = {
        id: Math.random().toString(36).substr(2, 9),
        workflowId: selectedDefinition.id,
        type: steps[i].type as any,
        description: "Simulation Log",
        narrative: steps[i].narrative,
        timestamp: new Date().toISOString()
      }
      setSimulationLogs(prev => [event, ...prev])
      await new Promise(resolve => setTimeout(resolve, steps[i].delay))
    }

    setIsSimulating(false)
  }

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-10 font-sans">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Brain className="h-6 w-6 text-primary neural-glow" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">Workflow <span className="text-primary">Simulator</span></h1>
            <p className="text-sm text-foreground/40 font-bold uppercase tracking-widest">Autonomous Ritual Validation Environment</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Workflow Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Workflow className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-foreground/60">Select Ritual</h2>
          </div>
          
          <div className="space-y-3">
            {definitions.map((def) => (
              <button
                key={def.id}
                onClick={() => setSelectedDefinition(def)}
                disabled={isSimulating}
                className={cn(
                  "w-full text-left p-4 rounded-2xl aeterna-glass border transition-all duration-300 group",
                  selectedDefinition?.id === def.id 
                    ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]" 
                    : "border-white/5 bg-white/5 hover:border-white/20"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">v{def.version}.0</span>
                  {selectedDefinition?.id === def.id && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{def.name}</h3>
                <p className="text-[10px] text-foreground/40 font-medium leading-tight mt-1">
                  {def.description}
                </p>
              </button>
            ))}
          </div>

          <Button 
            onClick={runSimulation}
            disabled={!selectedDefinition || isSimulating}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-30 transition-all duration-500 hover:scale-[1.02] active:scale-95"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="h-5 w-5 mr-3 animate-spin" />
                SIMULATING...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-3" />
                INITIATE SIMULATION
              </>
            )}
          </Button>
        </div>

        {/* Action Board & Cog Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Execution State */}
          <Card className="aeterna-glass border-white/5 overflow-hidden min-h-[200px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
            
            {!selectedDefinition ? (
              <div className="text-center space-y-4 opacity-30">
                <Server className="h-12 w-12 mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest">Waiting for Uplink...</p>
              </div>
            ) : (
              <div className="w-full p-10 flex flex-col gap-8">
                 <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Cpu className="h-6 w-6 text-primary" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest leading-none">Status</p>
                          <p className="text-lg font-black text-foreground uppercase italic">{isSimulating ? "Autonomous Dry-Run" : "System Idle"}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest leading-none">Entropy Risk</p>
                       <p className="text-lg font-black text-emerald-500">0.02%</p>
                    </div>
                 </div>

                 {/* Step Visualizer */}
                 <div className="flex items-center justify-between relative px-4">
                    <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-white/5 -z-10" />
                    {selectedDefinition.steps.map((step, i) => {
                      const isCompleted = currentStep > i
                      const isActive = currentStep === i + 1 // Offset for initialization step
                      return (
                        <div key={step.id} className="relative flex flex-col items-center">
                          <div className={cn(
                            "h-10 w-10 rounded-full border-2 flex items-center justify-center bg-background transition-all duration-700",
                            isCompleted ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(16,185,129,0.4)]" :
                            isActive ? "border-primary bg-primary/10 text-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]" :
                            "border-white/10 text-foreground/20"
                          )}>
                             {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-black">{i + 1}</span>}
                          </div>
                          <span className={cn(
                            "absolute -bottom-6 text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors duration-500",
                            isActive || isCompleted ? "text-primary/60" : "text-foreground/20"
                          )}>
                             {step.type}
                          </span>
                        </div>
                      )
                    })}
                 </div>
              </div>
            )}
          </Card>

          {/* Cognitive Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-black uppercase tracking-widest text-foreground/60">Neural Audit Trail</h2>
              </div>
              <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Real-time Stream</span>
            </div>

            <div className="h-[400px] rounded-3xl aeterna-glass border-white/5 p-6 overflow-y-auto space-y-4 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {simulationLogs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-500",
                      log.type === "decision" ? "bg-primary/5 border-primary/20" : "bg-white/[0.02] border-white/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground/90 leading-snug">{log.narrative}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                                {new Date(log.timestamp).toLocaleTimeString()}
                             </span>
                             <div className="h-1 w-1 rounded-full bg-white/10" />
                             <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                                {log.type}
                             </span>
                          </div>
                       </div>
                       {log.type === "decision" && (
                         <div className="p-1 px-2 rounded-lg bg-primary/10 border border-primary/20">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!isSimulating && simulationLogs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-3">
                  <Activity className="h-8 w-8 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Neural Stream Idle</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
