"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, Calendar, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSkin } from "@/components/theme/skin-provider"

interface PatientCardProps {
  patient: {
    id: string
    patient_id: string
    first_name: string
    last_name: string
    date_of_birth?: string
    phone?: string
    email?: string
    city?: string
    state?: string
    created_at?: string
  }
  className?: string
}

export function PatientCard({ patient, className }: PatientCardProps) {
  const { skin } = useSkin()
  const age = patient.date_of_birth
    ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
    : null

  return (
    <Card className={cn(
      "transition-all duration-500 group overflow-hidden rounded-[1.5rem] border",
      skin === "legacy" 
        ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-emerald-100" 
        : "aeterna-glass border-white/5 hover:border-primary/20",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn(
              "text-xl font-black flex items-center gap-3 transition-colors",
              skin === "legacy" ? "text-slate-900 group-hover:text-emerald-600" : "text-foreground group-hover:text-primary"
            )}>
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                skin === "legacy" ? "bg-emerald-50 text-emerald-500" : "bg-primary/10 text-primary"
              )}>
                <User className="h-6 w-6" />
              </div>
              {patient.first_name} {patient.last_name}
            </CardTitle>
            <CardDescription className={cn(
              "mt-2 text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
            )}>
              Patient ID: <span className={cn(
                "ml-1",
                skin === "legacy" ? "text-slate-600" : "text-foreground/60"
              )}>{patient.patient_id}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="grid gap-4">
          {patient.date_of_birth && (
            <div className="flex items-center gap-3">
              <Calendar className={cn(
                "h-4 w-4",
                skin === "legacy" ? "text-slate-300" : "text-foreground/30"
              )} />
              <div className="flex flex-col">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                  skin === "legacy" ? "text-slate-300" : "text-foreground/20"
                )}>Birth Date</span>
                <span className={cn(
                  "text-xs font-bold",
                  skin === "legacy" ? "text-slate-600" : "text-foreground/70"
                )}>
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                  {age && <span className="ml-1 opacity-50">({age} y/o)</span>}
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {patient.phone && (
              <div className="flex items-center gap-3">
                <Phone className={cn(
                  "h-4 w-4",
                  skin === "legacy" ? "text-slate-300" : "text-foreground/30"
                )} />
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                    skin === "legacy" ? "text-slate-300" : "text-foreground/20"
                  )}>Phone</span>
                  <span className={cn(
                    "text-xs font-bold truncate",
                    skin === "legacy" ? "text-slate-600" : "text-foreground/70"
                  )}>{patient.phone}</span>
                </div>
              </div>
            )}
            {patient.city && (
              <div className="flex items-center gap-3">
                <MapPin className={cn(
                  "h-4 w-4",
                  skin === "legacy" ? "text-slate-300" : "text-foreground/30"
                )} />
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                    skin === "legacy" ? "text-slate-300" : "text-foreground/20"
                  )}>Location</span>
                  <span className={cn(
                    "text-xs font-bold truncate",
                    skin === "legacy" ? "text-slate-600" : "text-foreground/70"
                  )}>
                    {patient.city}, {patient.state}
                  </span>
                </div>
              </div>
            )}
          </div>

          {patient.email && (
            <div className="flex items-center gap-3">
              <Mail className={cn(
                "h-4 w-4",
                skin === "legacy" ? "text-slate-300" : "text-foreground/30"
              )} />
              <div className="flex flex-col">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest leading-none mb-1",
                  skin === "legacy" ? "text-slate-300" : "text-foreground/20"
                )}>Email Address</span>
                <span className={cn(
                  "text-xs font-bold truncate",
                  skin === "legacy" ? "text-slate-600" : "text-foreground/70"
                )}>{patient.email}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={cn(
          "pt-6 border-t",
          skin === "legacy" ? "border-slate-50" : "border-white/5"
        )}>
          <Button 
            variant={skin === "legacy" ? "default" : "outline"} 
            className={cn(
              "w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-11 transition-all",
              skin === "legacy" 
                ? "bg-slate-900 text-white hover:bg-emerald-600 shadow-lg hover:shadow-emerald-500/20" 
                : "border-primary/20 hover:border-primary/50 text-foreground"
            )} 
            asChild
          >
            <Link href={`/patients/${patient.id}`}>
              ACCESS NEURAL RECORD
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
