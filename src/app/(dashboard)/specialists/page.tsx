"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus,
  ShieldCheck,
  Calendar,
  Mail,
  Phone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const specialists = [
  { id: "1", name: "Dr. Sarah Chen", specialty: "Oncology", status: "Active", clinicalIQ: 98, lastEncounter: "2h ago", credentialed: true },
  { id: "2", name: "Dr. James Wilson", specialty: "Endocrinology", status: "On Call", clinicalIQ: 94, lastEncounter: "1d ago", credentialed: true },
  { id: "3", name: "Dr. Elena Rodriguez", specialty: "Dermatology", status: "Active", clinicalIQ: 99, lastEncounter: "45m ago", credentialed: true },
  { id: "4", name: "Dr. Marcus Thorne", specialty: "Cardiology", status: "Inactive", clinicalIQ: 92, lastEncounter: "12d ago", credentialed: true },
  { id: "5", name: "Nurse Practitioner Kelly", specialty: "General Practice", status: "Active", clinicalIQ: 96, lastEncounter: "10m ago", credentialed: true },
]

export default function SpecialistHub() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Specialist Hub</h1>
          </div>
          <p className="text-foreground/40 text-sm font-medium">
            Registry and credentialing for all clinical affiliates and staff.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <UserPlus className="h-4 w-4" />
          Add specialist
        </button>
      </div>

      {/* Tactical Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: "128", trend: "+4" },
          { label: "Active Now", value: "42", trend: "Normal" },
          { label: "Avg Clinical IQ", value: "96%", trend: "+1.2%" },
          { label: "Pending Credentials", value: "3", trend: "-2" },
        ].map((stat, i) => (
          <Card key={i} className="aeterna-glass border-white/5 p-4 flex flex-col gap-1">
            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{stat.label}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter">{stat.value}</span>
              <span className="text-[10px] font-bold text-primary/60">{stat.trend}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Registry Table */}
      <Card className="aeterna-glass border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
              <input 
                type="text" 
                placeholder="Find specialists by name or specialty..." 
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/50 outline-none"
              />
            </div>
            <button title="Filter specialists" className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
              <Filter className="h-4 w-4 text-foreground/40" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 font-black text-foreground/30 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 font-black text-foreground/30 uppercase tracking-widest">Specialty</th>
                <th className="px-6 py-4 font-black text-foreground/30 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-black text-foreground/30 uppercase tracking-widest">Clinical IQ</th>
                <th className="px-6 py-4 font-black text-foreground/30 uppercase tracking-widest">Last Encounter</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {specialists.map((person, i) => (
                <motion.tr 
                  key={person.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {person.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{person.name}</span>
                        {person.credentialed && (
                          <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Credentialed
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-foreground/60 italic">
                      {person.specialty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full animate-pulse",
                        person.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                        person.status === "On Call" ? "bg-blue-500" : "bg-foreground/20"
                      )} />
                      <span className="font-bold text-foreground/60">{person.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-primary italic">
                    {person.clinicalIQ}
                  </td>
                  <td className="px-6 py-4 text-foreground/40 font-medium">
                    {person.lastEncounter}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="Schedule encounter" className="p-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                        <Calendar className="h-4 w-4" />
                      </button>
                      <button title="Send message" className="p-2 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button title="More options" className="p-2 rounded-lg hover:bg-white/10 transition-colors text-foreground/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
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
