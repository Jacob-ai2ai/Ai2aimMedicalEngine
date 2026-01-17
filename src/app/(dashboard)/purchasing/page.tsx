"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  ArrowRight,
  Plus,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const purchaseOrders = [
  { id: "PO-9021", vendor: "Medical Global Inc.", amount: "$12,450.00", date: "Jan 14, 2026", status: "Fulfillment", items: 24 },
  { id: "PO-9020", vendor: "BioTech Solutions", amount: "$3,120.00", date: "Jan 12, 2026", status: "Approved", items: 5 },
  { id: "PO-9019", vendor: "Nexus Supplies", amount: "$890.50", date: "Jan 10, 2026", status: "Shipped", items: 12 },
  { id: "PO-9018", vendor: "East Wing Textiles", amount: "$4,500.00", date: "Jan 08, 2026", status: "Delivered", items: 150 },
  { id: "PO-9017", vendor: "Medical Global Inc.", amount: "$15,200.00", date: "Jan 05, 2026", status: "Delivered", items: 42 },
]

export default function PurchasingCore() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Purchasing Core</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium">
            &quot;Autonomous procurement and vendor relationship management.&quot;
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus className="h-4 w-4" />
          New purchase edict
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Spend", value: "$42.8K", icon: CreditCard },
          { label: "Active Vendors", value: "18", icon: Building2 },
          { label: "Avg Lead Time", value: "4.2d", icon: Clock },
          { label: "Fulfillment Rate", value: "99.4%", icon: CheckCircle2 },
        ].map((stat, i) => (
          <Card key={i} className="aeterna-glass border-white/5 p-5 flex flex-col gap-1 relative overflow-hidden group">
             <stat.icon className="absolute right-[-5%] bottom-[-5%] h-12 w-12 text-primary opacity-[0.05] group-hover:scale-125 transition-transform duration-700" />
             <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{stat.label}</span>
             <span className="text-2xl font-black tracking-tighter italic">{stat.value}</span>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="aeterna-glass border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
            <input 
              type="text" 
              placeholder="Filter by PO number, vendor, or status..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/50 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all">
              <Filter className="h-4 w-4 text-foreground/40" />
            </button>
          </div>
        </div>

        <div className="p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 font-black text-foreground/20 uppercase tracking-widest">PO Number</th>
                <th className="px-6 py-4 font-black text-foreground/20 uppercase tracking-widest">Vendor</th>
                <th className="px-6 py-4 font-black text-foreground/20 uppercase tracking-widest">Items</th>
                <th className="px-6 py-4 font-black text-foreground/20 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-4 font-black text-foreground/20 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po, i) => (
                <motion.tr 
                  key={po.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-primary/80 italic">{po.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground/90">{po.vendor}</span>
                      <span className="text-[9px] text-foreground/30 uppercase font-black">{po.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground/60 italic font-medium">
                    {po.items} units
                  </td>
                  <td className="px-6 py-4 font-black text-foreground">
                    {po.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter",
                      po.status === "Delivered" ? "bg-emerald-500/10 text-emerald-500" :
                      po.status === "Shipped" ? "bg-blue-500/10 text-blue-500" :
                      po.status === "Fulfillment" ? "bg-orange-500/10 text-orange-500 animate-pulse" :
                      "bg-white/5 text-foreground/40"
                    )}>
                      {po.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="h-4 w-4 text-foreground/10 group-hover:text-primary transition-all ml-auto" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
