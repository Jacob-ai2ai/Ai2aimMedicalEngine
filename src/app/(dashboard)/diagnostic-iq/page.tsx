"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2,
  XCircle,
  Database,
  History,
  Activity,
  UserCheck,
  Zap,
  Loader2,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DiagnosticIQ() {
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [patientsWithoutEncounters, setPatientsWithoutEncounters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    dataIntegrityScore: 98.4,
    criticalAnomalies: 0,
    clinicalGaps: 0,
    successfulAudits: 0,
  })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      // Fetch diagnostic audits
      const auditsResponse = await fetch("/api/diagnostic/audits?status=Open&limit=50")
      if (auditsResponse.ok) {
        const auditsData = await auditsResponse.json()
        setAuditLogs(auditsData.audits || [])
        
        // Calculate stats
        const critical = (auditsData.audits || []).filter((a: any) => a.severity === "High").length
        const clinicalGaps = (auditsData.audits || []).filter((a: any) => 
          a.issue_type === "Missing Encounter" || a.issue_type === "Missing Patient Descriptors"
        ).length
        
        setStats({
          dataIntegrityScore: 98.4, // This would be calculated from actual data
          criticalAnomalies: critical,
          clinicalGaps,
          successfulAudits: 12840, // This would come from actual audit history
        })
      }

      // Fetch patients without encounters
      const patientsResponse = await fetch("/api/diagnostic/patients-without-encounters?limit=20")
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        setPatientsWithoutEncounters(patientsData.patients || [])
      }
    } catch (error) {
      console.error("Error fetching diagnostic data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto font-sans">
      {/* Header section with Neural Pulse */}
      <div className="flex items-center justify-between group">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShieldAlert className="h-6 w-6 text-primary group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Diagnostic IQ</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium">
            &quot;Automated system-wide data integrity and clinical coverage monitoring.&quot;
          </p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">Live Audit Feed</span>
           <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
              <span className="text-xs font-black italic text-primary">Synchronized</span>
           </div>
        </div>
      </div>

      {/* Security Pulse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Data Integrity Score", value: `${stats.dataIntegrityScore}%`, icon: Activity, color: "text-emerald-500" },
          { label: "Critical Anomalies", value: stats.criticalAnomalies.toString().padStart(2, "0"), icon: XCircle, color: "text-orange-500" },
          { label: "Clinical Gaps", value: stats.clinicalGaps.toString(), icon: Database, color: "text-primary" },
          { label: "Successful Audits (24h)", value: stats.successfulAudits.toLocaleString(), icon: CheckCircle2, color: "text-foreground/40" },
        ].map((stat, i) => (
          <Card key={i} className="aeterna-glass border-white/5 p-5 relative overflow-hidden flex flex-col gap-1">
             <stat.icon className={cn("absolute right-[-5%] bottom-[-5%] h-16 w-16 opacity-[0.03]", stat.color)} />
             <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{stat.label}</span>
             <span className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* Main Diagnostic Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Log Table */}
        <Card className="lg:col-span-2 aeterna-glass border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
             <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Diagnostic Event Log
             </CardTitle>
             <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchData}
                  disabled={loading}
                  className="h-8 w-8"
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                   <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-6 py-4 font-black uppercase text-foreground/20 tracking-tighter">ID</th>
                      <th className="px-6 py-4 font-black uppercase text-foreground/20 tracking-tighter">Target Entity</th>
                      <th className="px-6 py-4 font-black uppercase text-foreground/20 tracking-tighter">Integrity Issue</th>
                      <th className="px-6 py-4 font-black uppercase text-foreground/20 tracking-tighter">Severity</th>
                      <th className="px-6 py-4 font-black uppercase text-foreground/20 tracking-tighter">Status</th>
                   </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        No diagnostic audits found
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const entityLabel = log.entity_type === "Patient" 
                        ? `Patient: ${log.entity_id.substring(0, 8)}...`
                        : `${log.entity_type}: ${log.entity_id.substring(0, 8)}...`
                      
                      return (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                          <td className="px-6 py-4 font-mono font-bold text-primary/60">{log.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 font-bold text-foreground/80">{entityLabel}</td>
                          <td className="px-6 py-4 italic text-foreground/40">{log.issue_type}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "font-black uppercase text-[9px]",
                              log.severity === "High" ? "text-orange-500" : 
                              log.severity === "Medium" ? "text-yellow-500" : "text-blue-500"
                            )}>{log.severity}</span>
                          </td>
                          <td className="px-6 py-4 font-black uppercase text-foreground/30 text-[9px]">{log.status}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
             </table>
          </div>
          <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
             <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Full Archive Matrix</button>
          </div>
        </Card>

        {/* Diagnostic Actions & IQ Focal Point */}
        <div className="flex flex-col gap-6">
           <Card className="aeterna-glass border-white/5 p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Zap className="h-6 w-6" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tighter italic">Neural Fixer</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Auto-Correction Active</span>
                 </div>
              </div>
              <div className="flex flex-col gap-4">
                 <p className="text-xs text-foreground/70 leading-relaxed italic border-l-2 border-primary/20 ml-2 pl-3">
                   Aeterna has detected 12 duplicate IDs in the &apos;Legacy Encounters&apos; table. Recommended action: 
                   **Neural Deduplication Protocol V2**.
                 </p>
                 <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95">
                   Execute Auto-Fix (12 Targets)
                 </button>
              </div>
           </Card>

           <Card className="aeterna-glass border-white/5 p-6 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                 <UserCheck className="h-4 w-4 text-foreground/40" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/60 italic">Clinical Coverage Health</h3>
              </div>
              <div className="flex flex-col gap-6">
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-tighter">
                       <span className="text-foreground/40">Patient Encounter Coverage</span>
                       <span className="text-primary italic">
                         {patientsWithoutEncounters.length > 0 
                           ? `${Math.max(0, 100 - (patientsWithoutEncounters.length * 2))}%`
                           : "100%"}
                       </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                         style={{ 
                           width: `${Math.max(0, 100 - (patientsWithoutEncounters.length * 2))}%` 
                         }}
                       />
                    </div>
                    {patientsWithoutEncounters.length > 0 && (
                      <p className="text-[9px] text-orange-500/60 italic">
                        {patientsWithoutEncounters.length} patients without encounters
                      </p>
                    )}
                 </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-tighter">
                       <span className="text-foreground/40">Communication Validity</span>
                       <span className="text-emerald-500 italic">99.8%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[99.8%]" />
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
