"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  Download,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ClinicalBlockerCard } from "@/components/medical/clinical-blocker-card"

export default function FinancialMatrix() {
  const [metrics, setMetrics] = useState<any>(null)
  const [clinicalBlockers, setClinicalBlockers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch financial metrics
        const metricsResponse = await fetch("/api/billing/metrics")
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData.metrics)
        }

        // Fetch clinical blockers
        const blockersResponse = await fetch("/api/billing/clinical-blockers?limit=10")
        if (blockersResponse.ok) {
          const blockersData = await blockersResponse.json()
          setClinicalBlockers(blockersData.blockers || [])
        }
      } catch (error) {
        console.error("Error fetching billing data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const totalAR = (metrics?.ar0_30 || 0) + (metrics?.ar31_60 || 0) + (metrics?.ar61_90 || 0) + (metrics?.ar91Plus || 0)
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Financial Matrix</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium">
            &quot;Neural revenue tracking and Accounts Receivable synchronization.&quot;
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <Download className="h-3.5 w-3.5" />
            Export Audit
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <FileSpreadsheet className="h-4 w-4" />
            Billing Cycle
          </button>
        </div>
      </div>

      {/* Revenue Pulse Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: "Accounts Receivable", 
              value: formatCurrency(totalAR), 
              trend: "+12%", 
              color: "text-foreground" 
            },
            { 
              label: "Unbilled Encounters", 
              value: metrics?.clinicalBlockersCount?.toString() || "0", 
              trend: "-5", 
              color: "text-orange-500" 
            },
            { 
              label: "Daily Revenue Pulse", 
              value: formatCurrency(metrics?.revenuePulse || 0), 
              trend: "+0.4%", 
              color: "text-emerald-500" 
            },
            { 
              label: "System Rev IQ", 
              value: "92/100", 
              trend: "Stable", 
              color: "text-primary" 
            },
          ].map((stat, i) => (
            <Card key={i} className="aeterna-glass border-white/5 p-5 flex flex-col gap-1 relative overflow-hidden group">
              <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
                 <DollarSign className="h-20 w-20" />
              </div>
              <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest leading-none">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
                <span className="text-[9px] font-bold text-foreground/20 italic">{stat.trend}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AR Aging Board */}
        <Card className="lg:col-span-2 aeterna-glass border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground/60 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              AR Aging Dashboard
            </CardTitle>
            <div className="flex gap-2">
               <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black text-foreground/40 whitespace-nowrap">
                 0-30D: {formatCurrency(metrics?.ar0_30 || 0)}
               </div>
               <div className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/30 text-[9px] font-black text-orange-500 whitespace-nowrap">
                 90D+: {formatCurrency(metrics?.ar91Plus || 0)}
               </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-medium">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-6 py-4 text-foreground/20 uppercase font-black text-[10px]">Payer/Patient</th>
                  <th className="px-6 py-4 text-foreground/20 uppercase font-black text-[10px]">Type</th>
                  <th className="px-6 py-4 text-foreground/20 uppercase font-black text-[10px]">Aging</th>
                  <th className="px-6 py-4 text-foreground/20 uppercase font-black text-[10px]">Amount</th>
                  <th className="px-6 py-4 text-foreground/20 uppercase font-black text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                ) : clinicalBlockers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No clinical blockers found
                    </td>
                  </tr>
                ) : (
                  clinicalBlockers.slice(0, 10).map((blocker) => {
                    const daysAgo = Math.floor(
                      (new Date().getTime() - new Date(blocker.encounter_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                    return (
                      <tr key={blocker.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                        <td className="px-6 py-4 font-bold text-foreground/80">
                          {blocker.patient?.first_name} {blocker.patient?.last_name}
                        </td>
                        <td className="px-6 py-4 italic text-foreground/40">Encounter</td>
                        <td className="px-6 py-4 font-mono text-primary">{daysAgo}d</td>
                        <td className="px-6 py-4 font-black">-</td>
                        <td className="px-6 py-4">
                          <div className="inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter bg-orange-500/10 text-orange-500">
                            Unbilled
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Intelligence Insights */}
        <div className="flex flex-col gap-6">
           <Card className="aeterna-glass border-white/5 p-6 bg-primary/5 border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest">Neural Insights</h3>
              </div>
              <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-foreground/80 leading-relaxed italic">
                      &quot;Medicare reimbursement latency is up 12%. Aeterna recommends switching to Electronic Remittance Advice (ERA) for Sector 4.&quot;
                    </p>
                    <button className="text-[10px] text-primary font-black uppercase tracking-widest text-left hover:underline">Apply Optimization</button>
                 </div>
                 <div className="flex flex-col gap-1 pt-4 border-t border-white/5">
                    <p className="text-[11px] text-foreground/80 leading-relaxed italic">
                      &quot;Identified 14 unbilled encounters from &apos;Specialist Hub&apos; scheduling gap.&quot;
                    </p>
                    <button className="text-[10px] text-primary font-black uppercase tracking-widest text-left hover:underline">Auto-Link Billing</button>
                 </div>
              </div>
           </Card>

           <Card className="aeterna-glass border-white/5 p-6 border-orange-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Clinical Blockers</h3>
              </div>
              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : clinicalBlockers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center p-4">
                    No clinical blockers
                  </p>
                ) : (
                  clinicalBlockers.slice(0, 5).map((blocker) => (
                    <ClinicalBlockerCard
                      key={blocker.id}
                      blocker={blocker}
                    />
                  ))
                )}
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
