"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Zap, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Settings, 
  History,
  Activity,
  Plus,
  Cpu,
  Workflow
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useSkin } from "@/components/theme/skin-provider"

const automations = [
  { id: "AUTO-101", name: "Autonomous Infusion Dispatch", type: "Clinical", status: "Active", runs: 1240, success: "99.8%", nodeCount: 12 },
  { id: "AUTO-102", name: "Refill Authorization Loop", type: "Prescription", status: "Paused", runs: 3820, success: "94.2%", nodeCount: 8 },
  { id: "AUTO-103", name: "High-Priority Triage Routing", type: "Emergency", status: "Active", runs: 142, success: "100%", nodeCount: 24 },
  { id: "AUTO-104", name: "Billing Edict Generation", type: "Finance", status: "Active", runs: 850, success: "98.5%", nodeCount: 15 },
  { id: "AUTO-105", name: "Diagnostic IQ Audit Cycle", type: "Security", status: "Scheduled", runs: 12, success: "100%", nodeCount: 32 },
]

export default function AutomationsPage() {
  const { skin } = useSkin()
  
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Workflow Automations</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium">
            &quot;Design and deploy autonomous medical rituals via the Aeterna Runtime.&quot;
          </p>
        </div>
        <Link href="/automations/new" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="h-4 w-4" />
          Create Automation
        </Link>
      </div>

      {/* Real-time Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Rituals", value: "42", icon: Zap, color: "text-primary" },
          { label: "Executions (24h)", value: "8.4K", icon: Play, color: "text-emerald-500" },
          { label: "Compute Density", value: "92%", icon: Cpu, color: "text-blue-500" },
          { label: "System Autonomy", value: "High", icon: Activity, color: "text-white/60" },
        ].map((stat, i) => (
          <Card key={i} className="aeterna-glass border-white/5 p-5 flex flex-col gap-1 relative overflow-hidden group">
             <stat.icon className={cn("absolute right-[-5%] bottom-[-5%] h-12 w-12 opacity-[0.05]", stat.color)} />
             <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{stat.label}</span>
             <span className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Automation List */}
        <Card className="lg:col-span-2 aeterna-glass border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
             <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" />
                Autonomous Inventory
             </CardTitle>
             <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-foreground/40 transition-all">
                  <Search className="h-3.5 w-3.5" />
                </button>
                <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-foreground/40 transition-all">
                  <Filter className="h-3.5 w-3.5" />
                </button>
             </div>
          </div>
          
          <div className="divide-y divide-white/5">
            {automations.map((auto, i) => (
              <motion.div 
                key={auto.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                    auto.status === "Active" ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                    auto.status === "Paused" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" : "bg-white/5 border-white/10 text-foreground/20"
                  )}>
                    <Zap className={cn("h-6 w-6", auto.status === "Active" && "animate-pulse")} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black tracking-tight">{auto.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest italic">{auto.id}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-foreground/20" />
                      <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{auto.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Efficiency</span>
                      <span className="text-sm font-black text-emerald-500 italic">{auto.success}</span>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Executions</span>
                      <span className="text-sm font-black text-white/80">{auto.runs}</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <Settings className="h-4 w-4 text-foreground/40" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <History className="h-4 w-4 text-foreground/40" />
                      </button>
                      {auto.status === "Active" ? (
                        <button className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-all">
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Visual Workflow Examples */}
        <Card className="lg:col-span-2 aeterna-glass border-white/5 overflow-hidden mt-8">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              Sleep Clinic Workflow Examples
            </CardTitle>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'CPAP Compliance Alert', desc: 'Daily compliance check and alerts', href: '/automations/new?example=cpap-compliance' },
                { name: 'Sleep Study Dispatch', desc: 'Auto-dispatch monitors for studies', href: '/automations/new?example=sleep-study' },
                { name: 'DME Authorization', desc: 'Auto-check insurance and authorize', href: '/automations/new?example=dme-auth' },
                { name: 'PFT Results Processing', desc: 'Process and interpret PFT results', href: '/automations/new?example=pft-processing' },
                { name: 'Equipment Maintenance', desc: 'Schedule and track maintenance', href: '/automations/new?example=maintenance' },
                { name: 'Referral Processing', desc: 'Auto-process referral forms', href: '/automations/new?example=referral' }
              ].map((example, i) => (
                <Link
                  key={i}
                  href={example.href}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:scale-[1.02]",
                    skin === "legacy"
                      ? "bg-white border-slate-200 hover:border-emerald-300"
                      : "aeterna-glass border-white/10 hover:border-primary/30"
                  )}
                >
                  <h4 className={cn(
                    "text-sm font-black mb-1",
                    skin === "legacy" ? "text-slate-900" : "text-foreground"
                  )}>
                    {example.name}
                  </h4>
                  <p className={cn(
                    "text-xs",
                    skin === "legacy" ? "text-slate-600" : "text-foreground/60"
                  )}>
                    {example.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Cognitive Insight Panel */}
        <div className="flex flex-col gap-6">
           <Card className="aeterna-glass border-white/5 p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                 <Cpu className="h-4 w-4 text-primary" />
                 <h3 className="text-xs font-black uppercase tracking-widest italic">Aeterna Brain Synthesis</h3>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed italic border-l-2 border-primary/30 pl-3 py-1">
                &quot;System reliability is at 99.8%. Recommended audit: **AUTO-102 (Paused)** shows a 5.8% increase in authorization latency before suspension.&quot;
              </p>
              <button className="mt-4 w-full py-2.5 rounded-xl border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
                 Resolve Latency
              </button>
           </Card>

           <Card className="aeterna-glass border-white/5 p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4 italic">Recent Executions Log</h3>
              <div className="space-y-4">
                 {[
                   { name: "Infusion P102", status: "Success", time: "2m ago" },
                   { name: "Refill auth RE-1", status: "Bypassed", time: "12m ago" },
                   { name: "Billing Edict B-99", status: "Success", time: "1h ago" },
                 ].map((log, i) => (
                   <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-white/90">{log.name}</span>
                         <span className="text-[9px] text-foreground/40 font-black uppercase tracking-tighter">{log.time}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase italic",
                        log.status === "Success" ? "text-emerald-500" : "text-primary/60"
                      )}>{log.status}</span>
                   </div>
                 ))}
                 <button className="w-full text-center text-[9px] font-black uppercase tracking-widest text-foreground/20 hover:text-primary transition-all pt-2">View Full Telemetry</button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
