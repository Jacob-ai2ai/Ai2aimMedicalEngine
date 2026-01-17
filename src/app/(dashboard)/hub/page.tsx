"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  Database, 
  FileText, 
  Package, 
  Users, 
  Truck, 
  ShieldAlert, 
  Settings,
  Search,
  ArrowUpRight,
  Filter
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const MODULES = [
  { id: "1", name: "Specialist Hub", category: "Personnel", icon: Users, status: "stable", description: "Physician and Nurse scheduling and credentialing.", href: "/specialists" },
  { id: "2", name: "Logistics Core", category: "Operations", icon: Truck, status: "operational", description: "Supply chain management and warehouse tracking.", href: "/purchasing" },
  { id: "3", name: "Inventory Matrix", category: "Operations", icon: Package, status: "operational", description: "Real-time medication and hardware inventory.", href: "/inventory" },
  { id: "4", name: "Reporting Engine", category: "Analytics", icon: FileText, status: "stable", description: "Legacy PDF and CSV generation for compliance.", href: "/reports" },
  { id: "5", name: "Clinical Data Vault", category: "Database", icon: Database, status: "archived", description: "Consolidated patient history and EMR records.", href: "/patients" },
  { id: "6", name: "Compliance Auditor", category: "Security", icon: ShieldAlert, status: "stable", description: "HIPAA audit logs and access monitoring.", href: "/diagnostic-iq" },
  { id: "7", name: "Financial Matrix", category: "Finance", icon: BarChart3, status: "operational", description: "Real-time Accounts Receivable and revenue pulse tracking.", href: "/billing" },
  { id: "8", name: "Diagnostic IQ", category: "Security", icon: ShieldAlert, status: "stable", description: "System-wide data integrity audits and encounter gap analysis.", href: "/diagnostic-iq" },
]

export default function NeuralAnalyticsHub() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Neural Analytics Hub</h1>
        <p className="text-foreground/40 text-sm font-medium max-w-2xl">
          Centralized directory for legacy Ai2Aim RX modules. These systems are running within the 
          Aeterna virtualization layer for continued clinical stability.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
          <input 
            type="text" 
            placeholder="Search 32 Legacy Modules..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 placeholder:text-foreground/20"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:bg-white/10 transition-colors cursor-pointer">
          <Filter className="h-3 w-3" />
          Filter
        </div>
      </div>

      {/* Category Tabs (Skeleton) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All Modules", "Personnel", "Operations", "Analytics", "Security", "Database", "Logistics", "Purchasing"].map((cat) => (
          <button key={cat} className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap hover:border-primary/50 hover:text-primary transition-all">
            {cat}
          </button>
        ))}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((module, i) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={module.href}>
              <Card className="aeterna-glass border-white/5 hover:border-primary/30 group transition-all cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg font-bold tracking-tight">{module.name}</CardTitle>
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{module.category}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-xs text-foreground/60 leading-relaxed italic">
                    &quot;{module.description}&quot;
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full animate-pulse",
                        module.status === "operational" ? "bg-emerald-500" : 
                        module.status === "stable" ? "bg-blue-500" : "bg-orange-500"
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">{module.status}</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Initialize Interface</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
