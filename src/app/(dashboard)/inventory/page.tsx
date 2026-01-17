"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  Plus,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SerialNumberTracker } from "@/components/sleep-clinic/serial-number-tracker"
import { EquipmentAssignmentCard } from "@/components/sleep-clinic/equipment-assignment-card"
import type { DMEInventoryItem } from "@/lib/medical/dme-service"
import { useState, useEffect } from "react"

const inventory = [
  { id: "1", name: "Saline Solution (1000ml)", category: "Clinical", stock: 1420, minLevel: 500, status: "stable", price: "$12.40", warehouse: "East Wing" },
  { id: "2", name: "Insulin Humalog (10ml)", category: "Refrigerated", stock: 42, minLevel: 100, status: "critical", price: "$450.00", warehouse: "Cold Storage" },
  { id: "3", name: "Surgical Gloves (Size 7)", category: "Supplies", stock: 850, minLevel: 200, status: "stable", price: "$0.85", warehouse: "East Wing" },
  { id: "4", name: "Amoxicillin 500mg", category: "Clinical", stock: 120, minLevel: 150, status: "warning", price: "$2.10", warehouse: "Main Pharmacy" },
  { id: "5", name: "Patient Gowns (Blue)", category: "Textiles", stock: 320, minLevel: 100, status: "stable", price: "$15.00", warehouse: "Linen Services" },
]

export default function InventoryMatrix() {
  const [dmeInventory, setDmeInventory] = useState<DMEInventoryItem[]>([])
  const [dmeLoading, setDmeLoading] = useState(false)

  useEffect(() => {
    fetchDMEInventory()
  }, [])

  async function fetchDMEInventory() {
    setDmeLoading(true)
    try {
      // Fetch all DME inventory items
      const response = await fetch("/api/dme/inventory")
      if (response.ok) {
        const data = await response.json()
        // If we get stock levels, we need to fetch actual inventory items
        // For now, let's fetch by category
        const cpapResponse = await fetch("/api/dme/inventory?equipmentId=all")
        // This is a simplified approach - in production, you'd want a better endpoint
        setDmeInventory([])
      }
    } catch (error) {
      console.error("Error fetching DME inventory:", error)
    } finally {
      setDmeLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Inventory Matrix</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium italic">
            &quot;Neural supply-line monitoring and warehouse synchronization.&quot;
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Warehouses
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="aeterna-glass border-white/5 p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Package className="h-32 w-32" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Total SKU Value</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-4xl font-black tracking-tighter">$1.42M</span>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[70%]" />
            </div>
          </div>
        </Card>

        <Card className="aeterna-glass border-white/5 p-6 relative overflow-hidden group">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Critical Shortages</span>
              <AlertTriangle className="h-4 w-4 text-orange-500 animate-pulse" />
            </div>
            <span className="text-4xl font-black tracking-tighter text-orange-500">12</span>
            <p className="text-[10px] font-bold text-foreground/30 italic">Requires immediate procurement edicts.</p>
          </div>
        </Card>

        <Card className="aeterna-glass border-white/5 p-6 relative overflow-hidden group">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Supply Chain Latency</span>
              <TrendingDown className="h-4 w-4 text-primary" />
            </div>
            <span className="text-4xl font-black tracking-tighter">1.2d</span>
            <p className="text-[10px] font-bold text-foreground/30 italic">Average fulfillment time (Aeterna optimized).</p>
          </div>
        </Card>
      </div>

      {/* Tabs for Medical vs DME Inventory */}
      <Tabs defaultValue="medical" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="medical">Medical Supplies</TabsTrigger>
          <TabsTrigger value="dme">DME Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="medical" className="mt-0">
          {/* Main Inventory Board */}
          <Card className="aeterna-glass border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
            <input 
              type="text" 
              placeholder="Search SKU, Warehouse, or Category..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            {["Clinical", "Refrigerated", "Supplies"].map(t => (
              <button key={t} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:border-primary/40 transition-all">
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="p-0">
          <div className="grid grid-cols-1 divide-y divide-white/5">
            {inventory.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-500",
                    item.status === "critical" ? "bg-orange-500/10 border-orange-500/30 text-orange-500" :
                    item.status === "warning" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                    "bg-primary/10 border-primary/30 text-primary"
                  )}>
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-black tracking-tight">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{item.warehouse}</span>
                      <span className="h-1 w-1 rounded-full bg-foreground/20" />
                      <span className="text-[10px] font-black italic text-primary/60">{item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Stock Level</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-black tracking-tighter",
                        item.stock < item.minLevel ? "text-orange-500" : "text-foreground"
                      )}>{item.stock}</span>
                      <span className="text-[10px] font-bold text-foreground/20 italic">/ {item.minLevel} min</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Unit Price</span>
                    <span className="text-sm font-black text-white/80 italic">{item.price}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-foreground/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
        </TabsContent>

        <TabsContent value="dme" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="aeterna-glass border-white/5">
                <CardHeader>
                  <CardTitle>DME Equipment Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  {dmeLoading ? (
                    <p className="text-center text-muted-foreground py-8">Loading DME inventory...</p>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      DME inventory management. Use the DME Equipment page for detailed management.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <SerialNumberTracker />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
