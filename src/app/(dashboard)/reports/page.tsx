"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Search, 
  Download, 
  FilePieChart,
  FileBarChart,
  History,
  Clock,
  ExternalLink,
  Zap,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const reports = [
  { id: "R-001", name: "Monthly Clinical IQ Audit", type: "PDF", category: "Compliance", size: "1.2 MB", date: "Jan 1, 2026" },
  { id: "R-002", name: "Q4 Revenue & AR Matrix", type: "XLSX", category: "Finance", size: "4.5 MB", date: "Dec 31, 2025" },
  { id: "R-003", name: "Staff Productivity Heatmap", type: "PDF", category: "Personnel", size: "850 KB", date: "Jan 14, 2026" },
  { id: "R-004", name: "Pharmacy Inventory SLA", type: "CSV", category: "Operations", size: "2.1 MB", date: "Jan 12, 2026" },
  { id: "R-005", name: "Referral Conversion Report", type: "PDF", category: "Analytics", size: "1.8 MB", date: "Jan 10, 2026" },
]

export default function ReportingEngine() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Reporting Engine</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium italic">
            &quot;Legacy report generation and Aeterna synthesis matrix.&quot;
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
          <Zap className="h-4 w-4" />
          Generate New Matrix
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories / Side Bar */}
        <div className="flex flex-col gap-4">
           {["All Reports", "Clinical Audit", "Financials", "Personnel", "Inventory", "SLA Monitoring"].map((cat, i) => (
             <button key={cat} className={cn(
               "flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
               i === 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-foreground/40 hover:bg-white/10"
             )}>
                {cat}
                <ChevronRight className="h-3 w-3 opacity-20" />
             </button>
           ))}

           <Card className="aeterna-glass border-white/5 p-4 mt-4 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                 <Clock className="h-3 w-3 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Auto-Refreshed</span>
              </div>
              <p className="text-[10px] text-foreground/50 italic leading-relaxed">
                System-wide metrics are synchronized every 15 minutes.
              </p>
           </Card>
        </div>

        {/* Reports Board */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <Card className="aeterna-glass border-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                 <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-foreground/20" />
                    <input 
                      type="text" 
                      placeholder="Search reports by name or ID..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[10px] focus:ring-1 focus:ring-primary/50 outline-none"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-foreground/40">
                      <Filter className="h-3.5 w-3.5" />
                    </button>
                 </div>
              </div>
              <div className="p-0">
                 <div className="grid grid-cols-1 divide-y divide-white/5">
                    {reports.map((report, i) => (
                      <motion.div 
                        key={report.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-6 py-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                      >
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors">
                               {report.type === "PDF" ? <FileBarChart className="h-5 w-5" /> : <FilePieChart className="h-5 w-5" />}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-foreground/90">{report.name}</span>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{report.id}</span>
                                  <span className="h-0.5 w-0.5 rounded-full bg-foreground/20" />
                                  <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{report.category}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end">
                               <span className="text-[9px] font-black uppercase text-foreground/20 tracking-tighter">Generated</span>
                               <span className="text-[10px] font-bold text-foreground/40 whitespace-nowrap">{report.date}</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary transition-all hover:text-primary-foreground">
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-foreground/40 hover:bg-white/10 transition-all">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
           </Card>

           {/* Report Types Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Clinical IQ Matrix", count: "12 Reports", desc: "Detailed quality of care audits." },
                { label: "Financial Snapshots", count: "42 Reports", desc: "Aging and revenue pulse logs." },
                { label: "Logistics Logs", count: "8 Reports", desc: "Supply chain and procurement metrics." },
              ].map(card => (
                <Card key={card.label} className="aeterna-glass border-white/5 p-4 flex flex-col gap-2 hover:border-primary/30 transition-all cursor-pointer group">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80 group-hover:text-primary">{card.label}</h4>
                   <span className="text-xs font-bold text-foreground/60 leading-tight italic">&quot;{card.desc}&quot;</span>
                   <div className="flex items-center justify-between pt-4 mt-auto">
                      <span className="text-[9px] font-black uppercase text-foreground/20">{card.count}</span>
                      <ChevronRight className="h-3 w-3 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                   </div>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
