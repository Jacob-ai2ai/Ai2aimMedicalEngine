"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, Stethoscope, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSkin } from "@/components/theme/skin-provider"

interface Encounter {
  id: string
  encounter_date: string
  encounter_type?: string
  diagnosis?: string
  notes?: string
  billing_status: string
  providers?: {
    full_name?: string
    email?: string
  }
  specialists?: {
    name?: string
    specialty?: string
  }
}

interface EncounterTimelineProps {
  encounters: Encounter[]
  className?: string
}

export function EncounterTimeline({
  encounters,
  className,
}: EncounterTimelineProps) {
  const { skin } = useSkin()

  if (encounters.length === 0) {
    return (
      <div className={cn(
        "py-20 text-center rounded-[2rem] border-2 border-dashed transition-all duration-500",
        skin === "legacy" ? "bg-slate-50 border-slate-100/50" : "bg-white/[0.02] border-white/5",
        className
      )}>
        <Calendar className={cn(
          "h-12 w-12 mx-auto mb-4 opacity-20",
          skin === "legacy" ? "text-slate-400" : "text-foreground"
        )} />
        <p className="text-xs font-black uppercase tracking-widest text-foreground/30">Zero clinical events synchronized</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6 relative", className)}>
      {/* Neural Link Line */}
      <div className={cn(
        "absolute left-8 top-4 bottom-4 w-0.5 transition-colors duration-500",
        skin === "legacy" ? "bg-slate-50" : "bg-white/5"
      )} />

      {encounters.map((encounter, index) => (
        <Card
          key={encounter.id}
          className={cn(
            "relative ml-4 rounded-[2rem] border transition-all duration-500 group overflow-hidden",
            skin === "legacy" 
              ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-100" 
              : "aeterna-glass border-white/5 hover:border-primary/20",
            encounter.billing_status === "unbilled"
              ? (skin === "legacy" ? "border-l-[6px] border-l-orange-400" : "border-l-[6px] border-l-orange-500/50")
              : encounter.billing_status === "billed"
              ? (skin === "legacy" ? "border-l-[6px] border-l-blue-400" : "border-l-[6px] border-l-blue-500/50")
              : (skin === "legacy" ? "border-l-[6px] border-l-emerald-400" : "border-l-[6px] border-l-emerald-500/50")
          )}
        >
          {/* Pulse Node */}
          <div className={cn(
            "absolute left-[-2.5rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 transition-all duration-500 z-10",
            skin === "legacy" ? "bg-white border-slate-100" : "bg-background border-white/10 group-hover:border-primary/50 group-hover:scale-125"
          )} />

          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    skin === "legacy" ? "bg-emerald-50 text-emerald-500" : "bg-primary/10 text-primary"
                  )}>
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <span className={cn(
                      "text-xl font-black uppercase tracking-tight",
                      skin === "legacy" ? "text-slate-900" : "text-foreground"
                    )}>
                      {encounter.encounter_type || "Clinical Visit"}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                         encounter.billing_status === "unbilled"
                           ? "bg-orange-500/10 text-orange-500"
                           : encounter.billing_status === "billed"
                           ? "bg-blue-500/10 text-blue-500"
                           : "bg-emerald-500/10 text-emerald-500"
                       )}>
                         {encounter.billing_status}
                       </span>
                       <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/30">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(encounter.encounter_date).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {encounter.providers && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Attending Provider</p>
                      <div className="flex items-center gap-2">
                         <User className={cn("h-3.5 w-3.5", skin === "legacy" ? "text-slate-400" : "text-foreground/40")} />
                         <span className={cn("text-xs font-bold truncate", skin === "legacy" ? "text-slate-600" : "text-foreground/80")}>{encounter.providers.full_name || "N/A"}</span>
                      </div>
                    </div>
                  )}

                  {encounter.specialists && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Specialist Node</p>
                      <div className="flex items-center gap-2">
                         <User className={cn("h-3.5 w-3.5", skin === "legacy" ? "text-slate-400" : "text-foreground/40")} />
                         <span className={cn("text-xs font-bold truncate", skin === "legacy" ? "text-slate-600" : "text-foreground/80")}>{encounter.specialists.name} ({encounter.specialists.specialty})</span>
                      </div>
                    </div>
                  )}
                </div>

                {encounter.diagnosis && (
                  <div className={cn(
                    "p-6 rounded-[1.5rem] border transition-all",
                    skin === "legacy" ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
                  )}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Neural Diagnosis</p>
                    <p className={cn("text-sm font-bold", skin === "legacy" ? "text-slate-700" : "text-foreground/90")}>{encounter.diagnosis}</p>
                  </div>
                )}

                {encounter.notes && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-2">
                       <FileText className="h-3 w-3" /> Clinical Narrative
                    </p>
                    <p className={cn("text-xs font-medium leading-relaxed italic", skin === "legacy" ? "text-slate-500" : "text-foreground/50")}>{encounter.notes}</p>
                  </div>
                )}
              </div>
              
              <Button size="sm" variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 border-white/10 hover:border-primary/50 skin-legacy:border-slate-200">
                 ACCESS FULL LOG
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
