"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Sparkles, 
  Activity, 
  Users, 
  FileText, 
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Brain,
  Zap,
  Cpu,
  RefreshCw,
  Network,
  Globe,
  Pill,
  Mail,
  ArrowRight,
  Plus,
  BarChart3,
  BellRing,
  Package,
  Moon,
  TrendingDown,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CognitiveCard } from "@/components/ui/cognitive-card"
import { WorkflowArchitect } from "@/components/ui/workflow-architect"
import { createClientSupabase } from "@/lib/supabase/client"
import { WorkflowService } from "@/lib/workflow/service"
import { useSkin } from "@/components/theme/skin-provider"
import { WorkflowEvent } from "@/lib/workflow/types"
import { cn } from "@/lib/utils"
import { FollowUpAlertCard } from "@/components/medical/follow-up-alert-card"

export default function DashboardPage() {
  const { skin } = useSkin()
  const workflowService = WorkflowService.getInstance()
  const [events, setEvents] = useState<WorkflowEvent[]>([])
  const [activeThreads, setActiveThreads] = useState(12)
  const [followUps, setFollowUps] = useState<any[]>([])
  const [followUpCount, setFollowUpCount] = useState(0)
  const [nonCompliantCount, setNonCompliantCount] = useState(0)
  const [pendingStudies, setPendingStudies] = useState(0)
  const [equipmentAvailable, setEquipmentAvailable] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Fetch pending follow-ups
      try {
        const response = await fetch("/api/follow-ups/pending?limit=10")
        if (response.ok) {
          const data = await response.json()
          setFollowUps(data.followUps || [])
          setFollowUpCount(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching follow-ups:", error)
      }

      // Fetch sleep clinic data
      try {
        // Non-compliant CPAP patients
        const nonCompliantResponse = await fetch("/api/cpap/compliance/non-compliant")
        if (nonCompliantResponse.ok) {
          const data = await nonCompliantResponse.json()
          setNonCompliantCount(data.count || 0)
        }

        // Pending sleep studies
        const studiesResponse = await fetch("/api/sleep-studies?status=pending")
        if (studiesResponse.ok) {
          const data = await studiesResponse.json()
          setPendingStudies(data.count || 0)
        }

        // Available equipment
        const equipmentResponse = await fetch("/api/dme/inventory?status=available")
        if (equipmentResponse.ok) {
          const data = await equipmentResponse.json()
          // Count available items
          if (data.inventory && Array.isArray(data.inventory)) {
            setEquipmentAvailable(data.inventory.length)
          } else if (data.stockLevels) {
            const total = data.stockLevels.reduce((sum: number, level: any) => sum + (level.available || 0), 0)
            setEquipmentAvailable(total)
          }
        }
      } catch (error) {
        console.error("Error fetching sleep clinic data:", error)
      }
    }
    fetchData();

    // Initial load
    setEvents([...workflowService.getCognitiveFeed()])
    
    // Simulate real-time dispatch for demo
    const timer = setTimeout(async () => {
      await workflowService.deployWorkflow("wf-infusion-dispatch")
      setEvents([...workflowService.getCognitiveFeed()])
      setActiveThreads(prev => prev + 1)
    }, 3000)

    // Refresh follow-ups every 30 seconds
    const followUpInterval = setInterval(() => {
      fetch("/api/follow-ups/pending?limit=10")
        .then((res) => res.json())
        .then((data) => {
          setFollowUps(data.followUps || [])
          setFollowUpCount(data.count || 0)
        })
        .catch(console.error)
    }, 30000)

    return () => {
      clearTimeout(timer)
      clearInterval(followUpInterval)
    }
  }, [workflowService])

  const handleCompleteFollowUp = async (id: string) => {
    try {
      const response = await fetch(`/api/follow-ups/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        setFollowUps(followUps.filter((fu) => fu.id !== id))
        setFollowUpCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error completing follow-up:", error)
    }
  }

  return (
    <div className={cn(
      "p-8 lg:p-12 space-y-10 max-w-[1800px] mx-auto relative z-10 transition-colors duration-500",
      skin === "legacy" ? "modern-light-gradient min-h-screen pt-16" : ""
    )}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border",
              skin === "legacy" 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                : "bg-primary/15 text-primary border-primary/30"
            )}>
              Aeterna OS v2.2
            </span>
            <span className={cn(
              "text-xs font-semibold uppercase tracking-wide flex items-center gap-2",
              skin === "legacy" ? "text-slate-500" : "text-foreground/50"
            )}>
              <Globe className="h-4 w-4" /> Satellite Uplink: Active
            </span>
          </div>
          <h1 className={cn(
            "text-6xl md:text-7xl font-black tracking-tight leading-tight",
            skin === "legacy" ? "text-slate-900" : "text-foreground"
          )}>
            The Bridge <span className="text-primary neural-glow">Control</span>
          </h1>
          <p className={cn(
            "text-lg font-medium max-w-2xl",
            skin === "legacy" ? "text-slate-600" : "text-foreground/60"
          )}>
            Unified Neural Command Deck for Ai2aim Medical Ecosystem
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button asChild size="lg" className="rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-primary text-white font-bold px-10 py-6 h-auto">
            <Link href="/prescriptions/new">
              <Plus className="h-5 w-5 mr-2" />
              INITIATE RX
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className={cn(
              "rounded-2xl transition-all duration-300 px-10 py-6 h-auto font-semibold",
              skin === "legacy" 
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-md hover:shadow-lg"
                : "aeterna-glass border-white/15 hover:border-primary/50 text-foreground hover:bg-white/5"
            )}
          >
            <Brain className="h-5 w-5 mr-2 text-primary" />
            CORE ANALYTICS
          </Button>
        </div>
      </header>

      {/* Metrics Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className={cn(
          "p-8 relative overflow-hidden group transition-all duration-500 rounded-2xl",
          skin === "legacy" 
            ? "bg-white border-slate-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1" 
            : "aeterna-glass border-white/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20"
        )}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-500" : "text-foreground/50"
              )}>Active Patients</p>
              <p className={cn(
                "text-4xl font-black leading-none",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>1,280</p>
              <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4" /> +12%
              </p>
            </div>
            <div className={cn(
              "p-4 rounded-2xl transition-colors duration-500",
              skin === "legacy" ? "bg-emerald-50 text-emerald-500" : "text-primary/30 group-hover:text-primary/50 bg-primary/5"
            )}>
              <Users className="h-10 w-10" />
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-8 relative overflow-hidden group transition-all duration-500 rounded-2xl",
          skin === "legacy" 
            ? "bg-white border-slate-200 shadow-lg hover:shadow-xl hover:shadow-violet-500/20 hover:-translate-y-1" 
            : "aeterna-glass border-white/10 hover:border-secondary/40 hover:shadow-2xl hover:shadow-secondary/20"
        )}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-500" : "text-foreground/50"
              )}>Pending RX</p>
              <p className={cn(
                "text-4xl font-black leading-none",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>42</p>
              <p className="text-xs font-semibold text-violet-500 flex items-center gap-1.5">8 Urgent</p>
            </div>
            <div className={cn(
              "p-4 rounded-2xl transition-colors duration-500",
              skin === "legacy" ? "bg-violet-50 text-violet-500" : "text-secondary/30 group-hover:text-secondary/50 bg-secondary/5"
            )}>
              <Pill className="h-10 w-10" />
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-8 relative overflow-hidden group transition-all duration-500 rounded-2xl",
          skin === "legacy" 
            ? "bg-white border-slate-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1" 
            : "aeterna-glass border-white/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/20"
        )}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-500" : "text-foreground/50"
              )}>Faxes & Comms</p>
              <p className={cn(
                "text-4xl font-black leading-none",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>18</p>
              <p className="text-xs font-semibold text-blue-500 flex items-center gap-1.5">Secure</p>
            </div>
            <div className={cn(
              "p-4 rounded-2xl transition-colors duration-500",
              skin === "legacy" ? "bg-blue-50 text-blue-500" : "text-blue-400/30 group-hover:text-blue-400/50 bg-blue-500/5"
            )}>
              <Mail className="h-10 w-10" />
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-8 relative overflow-hidden group transition-all duration-500 rounded-2xl",
          skin === "legacy" 
            ? "bg-white border-slate-200 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1" 
            : "aeterna-glass border-white/10 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/20"
        )}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-500" : "text-foreground/50"
              )}>At-Risk Follow-ups</p>
              <p className={cn(
                "text-4xl font-black leading-none",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>{followUpCount}</p>
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5">Pending</p>
            </div>
            <div className={cn(
              "p-4 rounded-2xl transition-colors duration-500",
              skin === "legacy" ? "bg-red-50 text-red-500" : "text-red-400/30 group-hover:text-red-400/50 bg-red-500/5"
            )}>
              <BellRing className="h-10 w-10" />
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-8 relative overflow-hidden group transition-all duration-500 rounded-2xl",
          skin === "legacy" 
            ? "bg-white border-slate-200 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1" 
            : "aeterna-glass border-white/10 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/20"
        )}>
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-500" : "text-foreground/50"
              )}>Revenue Pulse</p>
              <p className={cn(
                "text-4xl font-black leading-none",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>$412K</p>
              <p className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">AR Optimized</p>
            </div>
            <div className={cn(
              "p-4 rounded-2xl transition-colors duration-500",
              skin === "legacy" ? "bg-amber-50 text-amber-500" : "text-emerald-400/30 group-hover:text-emerald-400/50 bg-emerald-500/5"
            )}>
              <BarChart3 className="h-10 w-10" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Bridge Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cognitive Feed & Architect */}
        <div className="lg:col-span-2 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Brain className={cn(
                  "h-7 w-7 neural-glow",
                  skin === "legacy" ? "text-emerald-500" : "text-primary"
                )} />
                <h2 className={cn(
                  "text-lg font-bold uppercase tracking-wide",
                  skin === "legacy" ? "text-slate-600" : "text-foreground"
                )}>Cognitive Decision Feed</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  skin === "legacy" ? "text-emerald-600" : "text-primary"
                )}>Live Neural Stream</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Follow-up Alerts */}
              {followUps.length > 0 && (
                <div className="space-y-3 mb-6">
                  {followUps.slice(0, 3).map((followUp) => (
                    <FollowUpAlertCard
                      key={followUp.id}
                      followUp={followUp}
                      onComplete={handleCompleteFollowUp}
                    />
                  ))}
                  {followUps.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" asChild className={cn(
                        "font-bold text-[10px] uppercase tracking-widest",
                        skin === "legacy" ? "text-slate-400 hover:text-emerald-600" : ""
                      )}>
                        <Link href="/patients" className="flex items-center gap-2">
                          View {followUps.length - 3} more follow-ups
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Workflow Events */}
              {events.length === 0 && followUps.length === 0 ? (
                <div className={cn(
                  "p-20 text-center rounded-2xl border transition-all duration-500",
                  skin === "legacy" 
                    ? "bg-white border-slate-200 shadow-lg" 
                    : "aeterna-glass border-white/10"
                )}>
                  <RefreshCw className={cn(
                    "h-12 w-12 mx-auto animate-spin mb-6",
                    skin === "legacy" ? "text-slate-300" : "text-foreground/20"
                  )} />
                  <p className={cn(
                    "text-sm font-semibold uppercase tracking-wide",
                    skin === "legacy" ? "text-slate-400" : "text-foreground/50"
                  )}>Listening for autonomous neural events...</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="group relative">
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5 transition-all rounded-full",
                      skin === "legacy" ? "bg-emerald-200 group-hover:bg-emerald-500" : "bg-primary/30 group-hover:bg-primary"
                    )} />
                    <div className={cn(
                      "ml-8 p-6 transition-all duration-500 rounded-2xl border",
                      skin === "legacy" 
                        ? "bg-white border-slate-200 shadow-md hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5" 
                        : "aeterna-glass border-white/10 hover:border-primary/30 hover:shadow-xl"
                    )}>
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <p className={cn(
                            "text-lg font-semibold transition-colors leading-snug",
                            skin === "legacy" ? "text-slate-800 group-hover:text-emerald-600" : "text-foreground group-hover:text-primary"
                          )}>
                            {event.narrative}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-xs font-medium",
                              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
                            )}>
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={cn(
                              "text-xs px-3 py-1 rounded-lg font-semibold uppercase tracking-wide border",
                              skin === "legacy" 
                                ? "bg-slate-50 text-slate-500 border-slate-200" 
                                : "bg-white/5 text-foreground/50 border-white/10"
                            )}>
                              {event.description}
                            </span>
                          </div>
                        </div>
                        <div className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border shrink-0",
                          event.type === "decision" 
                            ? (skin === "legacy" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-primary/15 text-primary border-primary/30")
                            : (skin === "legacy" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-blue-500/15 text-blue-400 border-blue-500/30")
                        )}>
                          {event.type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <Network className={cn(
                "h-7 w-7",
                skin === "legacy" ? "text-violet-500" : "text-secondary"
              )} />
              <h2 className={cn(
                "text-lg font-bold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-600" : "text-foreground"
              )}>Workflow Architect Loop</h2>
            </div>
            <CognitiveCard className="p-0 overflow-hidden rounded-2xl">
               <div className="p-8">
                  <WorkflowArchitect />
               </div>
            </CognitiveCard>
          </section>
        </div>

        {/* Right Column: Fleet Command & Diagnostics */}
        <div className="space-y-10">
          <CognitiveCard
            suggestion="Staffing Optimization Active"
            aiReasoning="Infusion volume spike detected at 14:32. Rerouted 3 nurses from low-latency departments to maintain SLA."
          >
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest",
                    skin === "legacy" ? "text-slate-400" : "text-foreground/40"
                  )}>System IQ Confidence</span>
                  <span className="text-sm font-black text-emerald-500">94.8%</span>
                </div>
                <div className={cn(
                  "h-2 w-full rounded-full overflow-hidden border transition-all",
                  skin === "legacy" ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                )}>
                  <div className="h-full bg-emerald-500 neural-glow transition-all duration-1000" style={{ width: '94.8%' }} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-5 rounded-2xl border transition-all",
                  skin === "legacy" ? "bg-slate-50 border-slate-100 group-hover:border-emerald-200" : "bg-white/[0.02] border-white/5 group-hover:border-primary/20"
                )}>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2",
                    skin === "legacy" ? "text-slate-300" : "text-foreground/30"
                  )}>
                    <Cpu className="h-3.5 w-3.5" /> Threads
                  </p>
                  <p className={cn(
                    "text-2xl font-black",
                    skin === "legacy" ? "text-slate-900" : "text-foreground"
                  )}>{activeThreads}</p>
                </div>
                <div className={cn(
                  "p-5 rounded-2xl border transition-all",
                  skin === "legacy" ? "bg-slate-50 border-slate-100 group-hover:border-violet-200" : "bg-white/[0.02] border-white/5 group-hover:border-secondary/20"
                )}>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2",
                    skin === "legacy" ? "text-slate-300" : "text-foreground/30"
                  )}>
                    <Zap className={cn("h-3.5 w-3.5", skin === "legacy" ? "text-violet-400" : "text-secondary")} /> Uptime
                  </p>
                  <p className={cn(
                    "text-2xl font-black",
                    skin === "legacy" ? "text-slate-900" : "text-foreground"
                  )}>99.9<span className="text-sm opacity-20">%</span></p>
                </div>
              </div>

              <Button className={cn(
                "w-full py-8 rounded-[1.5rem] font-black tracking-widest uppercase transition-all duration-300 border shadow-lg hover:shadow-xl",
                skin === "legacy" 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 shadow-emerald-500/5" 
                  : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              )}>
                Aeterna Simulation Panel
              </Button>
            </div>
          </CognitiveCard>

          {/* Sleep Clinic Widgets */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <Moon className={cn(
                "h-7 w-7",
                skin === "legacy" ? "text-emerald-500" : "text-primary"
              )} />
              <h2 className={cn(
                "text-lg font-bold uppercase tracking-wide",
                skin === "legacy" ? "text-slate-600" : "text-foreground"
              )}>Sleep Clinic Status</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className={cn(
                "p-6 transition-all rounded-2xl border",
                skin === "legacy" 
                  ? "bg-white border-slate-200 shadow-md hover:shadow-lg hover:border-orange-300 hover:-translate-y-0.5" 
                  : "aeterna-glass border-white/10 hover:border-orange-500/40 hover:shadow-xl"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-xs font-semibold uppercase tracking-wide mb-1",
                      skin === "legacy" ? "text-slate-500" : "text-foreground/50"
                    )}>Non-Compliant</p>
                    <p className="text-3xl font-black text-orange-500 leading-none">{nonCompliantCount}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-500/30" />
                </div>
              </Card>

              <Card className={cn(
                "p-6 transition-all rounded-2xl border",
                skin === "legacy" 
                  ? "bg-white border-slate-200 shadow-md hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5" 
                  : "aeterna-glass border-white/10 hover:border-blue-500/40 hover:shadow-xl"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-xs font-semibold uppercase tracking-wide mb-1",
                      skin === "legacy" ? "text-slate-500" : "text-foreground/50"
                    )}>Pending Studies</p>
                    <p className="text-3xl font-black text-blue-500 leading-none">{pendingStudies}</p>
                  </div>
                  <Moon className="h-8 w-8 text-blue-500/30" />
                </div>
              </Card>

              <Card className={cn(
                "p-6 transition-all rounded-2xl border col-span-2",
                skin === "legacy" 
                  ? "bg-white border-slate-200 shadow-md hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5" 
                  : "aeterna-glass border-white/10 hover:border-primary/40 hover:shadow-xl"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-xs font-semibold uppercase tracking-wide mb-1",
                      skin === "legacy" ? "text-slate-500" : "text-foreground/50"
                    )}>Equipment Available</p>
                    <p className="text-3xl font-black text-emerald-500 leading-none">{equipmentAvailable}</p>
                  </div>
                  <Package className="h-8 w-8 text-emerald-500/30" />
                </div>
              </Card>
            </div>

            {(nonCompliantCount > 0 || pendingStudies > 0) && (
              <Button variant="outline" className={cn(
                "w-full h-14 rounded-2xl transition-all font-semibold tracking-wide uppercase text-sm",
                skin === "legacy" 
                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm hover:shadow-md" 
                  : "border-primary/30 text-primary hover:bg-primary/15 hover:border-primary/50"
              )} asChild>
                <Link href="/cpap/compliance">
                  View Sleep Clinic Dashboard
                </Link>
              </Button>
            )}
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-4">
                <ShieldAlert className="h-7 w-7 text-red-500" />
                <h2 className={cn(
                  "text-lg font-bold uppercase tracking-wide",
                  skin === "legacy" ? "text-slate-600" : "text-foreground"
                )}>High-Priority Alerts</h2>
             </div>
             
             <div className={cn(
                "p-8 rounded-2xl border space-y-4 transition-all",
                skin === "legacy" 
                  ? "bg-red-50 border-red-200 shadow-lg hover:shadow-xl" 
                  : "aeterna-glass border-red-500/30 bg-red-500/10"
             )}>
                <div className="flex items-center gap-3">
                   <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                   <p className="text-sm font-bold text-red-600 uppercase tracking-wide">Tribunal Override Required</p>
                </div>
                <p className={cn(
                  "text-base font-medium leading-relaxed",
                  skin === "legacy" ? "text-red-700" : "text-foreground/80"
                )}>
                   Nexus-Physician flagged a contradictory dosing instruction in Room 4-B. Manual intervention bypassed by Vanguard-Compliance.
                </p>
                <Button size="lg" variant="outline" className={cn(
                  "w-full h-12 transition-all text-sm font-bold uppercase tracking-wide rounded-2xl",
                  skin === "legacy" ? "border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400" : "border-red-500/30 text-red-400 hover:bg-red-500/15 hover:border-red-500/50"
                )}>
                   INVESTIGATE PROTOCOL
                </Button>
             </div>
          </section>
        </div>
      </div>
    </div>
  )
}
