"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientSupabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  ArrowLeft, 
  Pill, 
  Mail, 
  Calendar, 
  Clock,
  Loader2,
  Users,
  ShieldAlert,
  FileText,
  Zap
} from "lucide-react"
import { EncounterTimeline } from "@/components/medical/encounter-timeline"
import { cn } from "@/lib/utils"
import { useSkin } from "@/components/theme/skin-provider"

export default function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { skin } = useSkin()
  const supabase = createClientSupabase()
  const [patient, setPatient] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [communications, setCommunications] = useState<any[]>([])
  const [encounters, setEncounters] = useState<any[]>([])
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"prescriptions" | "communications" | "encounters" | "followups">("prescriptions")

  const fetchData = useCallback(async () => {
    try {
      // Fetch patient
      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("id", params.id)
        .single()

      if (patientData) {
        setPatient(patientData)
      }

      // Fetch prescriptions
      const { data: prescriptionsData } = await supabase
        .from("prescriptions")
        .select(`
          *,
          medications:medication_id (
            name,
            dosage_form
          )
        `)
        .eq("patient_id", params.id)
        .order("created_at", { ascending: false })

      if (prescriptionsData) {
        setPrescriptions(prescriptionsData)
      }

      // Fetch communications
      const { data: communicationsData } = await supabase
        .from("communications")
        .select("*")
        .eq("patient_id", params.id)
        .order("created_at", { ascending: false })

      if (communicationsData) {
        setCommunications(communicationsData)
      }

      // Fetch encounters
      const encountersResponse = await fetch(`/api/encounters/patient/${params.id}`)
      if (encountersResponse.ok) {
        const encountersData = await encountersResponse.json()
        setEncounters(encountersData.encounters || [])
      }

      // Fetch follow-ups
      const followUpsResponse = await fetch(`/api/follow-ups?patientId=${params.id}`)
      if (followUpsResponse.ok) {
        const followUpsData = await followUpsResponse.json()
        setFollowUps(followUpsData.followUps || [])
      }
    } catch (error) {
      console.error("Error fetching patient data:", error)
    } finally {
      setLoading(false)
    }
  }, [params.id, supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-12 text-center">
        <p className="text-xl font-black uppercase tracking-widest text-foreground/40">Patient Module Not Found</p>
        <Button asChild variant="outline" className="mt-8 rounded-2xl">
          <Link href="/patients">RETURN TO MATRIX</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto transition-all duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div className="space-y-4">
          <Link 
            href="/patients" 
            className={cn(
              "inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-colors",
              skin === "legacy" ? "text-slate-400 hover:text-emerald-600" : "text-foreground/40 hover:text-primary"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Registry
          </Link>
          <div className="flex items-center gap-6">
            <div className={cn(
              "w-20 h-20 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-500",
              skin === "legacy" ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10" : "bg-primary/10 border-primary/20 text-primary neural-glow"
            )}>
              <Users className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h1 className={cn(
                "text-5xl font-black tracking-tighter uppercase",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>
                {patient.first_name} <span className="text-primary neural-glow">{patient.last_name}</span>
              </h1>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                  skin === "legacy" ? "bg-slate-50 border-slate-100 text-slate-400" : "bg-white/5 border-white/10 text-foreground/40"
                )}>
                  Biological ID: <span className={skin === "legacy" ? "text-slate-600" : "text-foreground/80"}>{patient.patient_id}</span>
                </span>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Live Uplink</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="rounded-2xl h-12 px-6 font-black tracking-widest uppercase border-white/10 hover:bg-white/5 skin-legacy:border-slate-200">
              EDIT PROFILE
           </Button>
           <Button className="rounded-2xl h-12 px-8 font-black tracking-widest uppercase bg-primary text-white shadow-xl shadow-emerald-500/20">
              INITIATE RX
           </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className={cn(
          "rounded-[2.5rem] border-none transition-all duration-500",
          skin === "legacy" ? "bg-white shadow-2xl shadow-slate-200/50" : "aeterna-glass border-white/5"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary">Biometric Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Birth Cycle</p>
                <p className={cn("text-sm font-bold", skin === "legacy" ? "text-slate-700" : "text-foreground/80")}>
                  {patient.date_of_birth
                    ? new Date(patient.date_of_birth).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Gender Orientation</p>
                <p className={cn("text-sm font-bold uppercase", skin === "legacy" ? "text-slate-700" : "text-foreground/80")}>{patient.gender || "Undefined"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Contact Uplink</p>
                <p className={cn("text-sm font-bold", skin === "legacy" ? "text-slate-700" : "text-foreground/80")}>{patient.phone || "No Link"}</p>
                <p className={cn("text-xs font-medium opacity-50 truncate", skin === "legacy" ? "text-slate-500" : "text-foreground/40")}>{patient.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Geographic Node</p>
                <p className={cn("text-sm font-bold", skin === "legacy" ? "text-slate-700" : "text-foreground/80")}>
                  {patient.city}, {patient.state}
                </p>
              </div>
            </div>
            
            <div className={cn(
              "p-6 rounded-[1.5rem] border transition-all",
              skin === "legacy" ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/5"
            )}>
               <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-3">Residential Vector</p>
               <p className={cn("text-xs font-bold leading-relaxed", skin === "legacy" ? "text-slate-600" : "text-foreground/60")}>
                  {patient.address_line1} {patient.address_line2}
                  <br />
                  {patient.city}, {patient.state} {patient.zip_code}
               </p>
            </div>

            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Medical Insurance Coverage</p>
              <div className={cn(
                "p-5 rounded-2xl flex items-center justify-between transition-all",
                skin === "legacy" ? "bg-violet-50/50 border border-violet-100" : "bg-secondary/5 border border-secondary/20"
              )}>
                 <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      skin === "legacy" ? "bg-violet-100 text-violet-600" : "bg-secondary/20 text-secondary"
                    )}>
                       <Clock className="h-4 w-4" />
                    </div>
                    <div>
                       <p className={cn("text-xs font-black uppercase tracking-tighter", skin === "legacy" ? "text-violet-700" : "text-secondary")}>
                          {patient.insurance_provider}
                       </p>
                       <p className="text-[10px] font-bold opacity-50">ID: {patient.insurance_id}</p>
                    </div>
                 </div>
                 <Badge variant="outline" className="rounded-md border-emerald-500/50 text-emerald-500 text-[8px] font-black uppercase">ACTIVE</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History & Alerts Card */}
        <div className="lg:col-span-2 space-y-10">
          <Card className={cn(
            "rounded-[2.5rem] border-none transition-all duration-500",
            skin === "legacy" ? "bg-white shadow-2xl shadow-slate-200/50" : "aeterna-glass border-white/5"
          )}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Critical Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                     <ShieldAlert className="h-4 w-4 text-red-500" />
                     <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Biologic Allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies && Array.isArray(patient.allergies) ? (
                      patient.allergies.map((allergy: string, i: number) => (
                        <Badge key={i} className="rounded-lg bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 transition-colors uppercase font-black text-[9px] px-3 py-1">
                          {allergy}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest">No known biological conflicts</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Medical Narrative</p>
                   </div>
                   <p className={cn(
                    "text-sm font-medium leading-relaxed italic",
                    skin === "legacy" ? "text-slate-500" : "text-foreground/50"
                   )}>
                    {patient.medical_history || "No historical narrative initialized."}
                   </p>
                </div>
              </div>
              <div className={cn(
                "mt-8 p-6 rounded-[2rem] border transition-all flex items-center justify-between gap-6",
                skin === "legacy" ? "bg-slate-50 border-slate-100" : "bg-white/5 border-white/10"
              )}>
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                       <Zap className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Emergency Uplink</p>
                       <p className={cn("text-base font-black tracking-tight", skin === "legacy" ? "text-slate-900" : "text-foreground")}>{patient.emergency_contact_name}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Direct Link</p>
                    <p className={cn("text-lg font-black tracking-tighter", skin === "legacy" ? "text-slate-900" : "text-primary")}>{patient.emergency_contact_phone}</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Tabs */}
          <div className="space-y-6">
            <div className={cn(
              "flex items-center p-2 rounded-2xl gap-2 transition-all duration-500",
              skin === "legacy" ? "bg-slate-100" : "bg-white/5"
            )}>
              {[
                { id: "prescriptions", label: "Prescription Matrix", icon: Pill, count: prescriptions.length },
                { id: "communications", label: "Neural Feed", icon: Mail, count: communications.length },
                { id: "encounters", label: "Clinical Log", icon: Calendar, count: encounters.length },
                { id: "followups", label: "Bio-Cycles", icon: Clock, count: followUps.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === tab.id
                      ? (skin === "legacy" 
                          ? "bg-white text-emerald-600 shadow-md shadow-emerald-500/10 border border-emerald-100" 
                          : "bg-primary text-white shadow-xl shadow-primary/20")
                      : (skin === "legacy"
                          ? "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                          : "text-foreground/40 hover:text-foreground hover:bg-white/5")
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold",
                    activeTab === tab.id 
                      ? (skin === "legacy" ? "bg-emerald-50" : "bg-white/20") 
                      : (skin === "legacy" ? "bg-slate-200/50" : "bg-white/10")
                  )}>{tab.count}</span>
                </button>
              ))}
            </div>

            <Card className={cn(
              "rounded-[2.5rem] border-none transition-all duration-500 min-h-[400px]",
              skin === "legacy" ? "bg-white shadow-2xl shadow-slate-200/50" : "aeterna-glass border-white/5"
            )}>
              <CardContent className="p-8">
                {activeTab === "prescriptions" && (
                  <div className="grid gap-4">
                    {prescriptions.length > 0 ? (
                      prescriptions.map((prescription: any) => (
                        <div
                          key={prescription.id}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-2xl border transition-all group",
                            skin === "legacy" ? "bg-slate-50 border-slate-100 hover:border-emerald-200" : "bg-white/[0.02] border-white/5 hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-5">
                             <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                skin === "legacy" ? "bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm" : "bg-white/5 text-foreground/30 group-hover:text-primary"
                             )}>
                                <Pill className="h-6 w-6" />
                             </div>
                             <div>
                                <p className={cn("text-lg font-black tracking-tight", skin === "legacy" ? "text-slate-900" : "text-foreground")}>
                                  {prescription.medications?.name} <span className="text-primary font-bold opacity-70">/ {prescription.dosage}</span>
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">RX: {prescription.prescription_number}</p>
                                   <Badge variant="outline" className={cn(
                                     "text-[8px] font-black uppercase tracking-widest",
                                     prescription.status === "active" ? "border-emerald-500/50 text-emerald-500" : "border-foreground/20 text-foreground/40"
                                   )}>{prescription.status}</Badge>
                                </div>
                             </div>
                          </div>
                          <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 border-white/10 hover:border-primary/50 skin-legacy:border-slate-200" asChild>
                            <Link href={`/prescriptions/${prescription.id}`}>VIEW UPLINK</Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 opacity-30">
                         <Pill className="h-12 w-12 mx-auto mb-4" />
                         <p className="font-black uppercase tracking-widest text-xs">No active molecular protocols</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "communications" && (
                  <div className="space-y-4">
                    {communications.length > 0 ? (
                      communications.map((comm: any) => (
                        <div
                          key={comm.id}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-2xl border transition-all group",
                            skin === "legacy" ? "bg-slate-50 border-slate-100 hover:border-emerald-200" : "bg-white/[0.02] border-white/5 hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-5">
                             <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                skin === "legacy" ? "bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm" : "bg-white/5 text-foreground/30 group-hover:text-primary"
                             )}>
                                <Mail className="h-6 w-6" />
                             </div>
                             <div>
                                <p className={cn("text-lg font-black tracking-tight uppercase", skin === "legacy" ? "text-slate-900" : "text-foreground")}>
                                  {comm.communication_type} <span className="text-primary font-bold opacity-70">/ {comm.direction}</span>
                                </p>
                                <p className="text-sm font-medium text-foreground/50 mt-1">{comm.subject || "Neural Link: No Subject"}</p>
                             </div>
                          </div>
                          <Button variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 h-10 border-white/10 hover:border-primary/50 skin-legacy:border-slate-200" asChild>
                            <Link href={`/communications/${comm.id}`}>OPEN FEED</Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 opacity-30">
                         <Mail className="h-12 w-12 mx-auto mb-4" />
                         <p className="font-black uppercase tracking-widest text-xs">Zero neural events recorded</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "encounters" && (
                  <div>
                    {encounters.length > 0 ? (
                      <EncounterTimeline encounters={encounters} />
                    ) : (
                      <div className="text-center py-20 opacity-30">
                         <Calendar className="h-12 w-12 mx-auto mb-4" />
                         <p className="font-black uppercase tracking-widest text-xs">No clinical logs initialized</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "followups" && (
                  <div className="grid gap-4">
                    {followUps.length > 0 ? (
                      followUps.map((followUp: any) => (
                        <div
                          key={followUp.id}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-2xl border transition-all group",
                            skin === "legacy" ? "bg-slate-50 border-slate-100 hover:border-emerald-200" : "bg-white/[0.02] border-white/5 hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-5">
                             <div className={cn(
                                "p-3 rounded-xl transition-colors",
                                skin === "legacy" ? "bg-white text-slate-400 group-hover:text-emerald-500 shadow-sm" : "bg-white/5 text-foreground/30 group-hover:text-primary"
                             )}>
                                <Clock className="h-6 w-6" />
                             </div>
                             <div>
                                <p className={cn("text-lg font-black tracking-tight uppercase", skin === "legacy" ? "text-slate-900" : "text-foreground")}>
                                  {followUp.follow_up_type} CYCLE
                                </p>
                                <p className="text-sm font-bold text-primary mt-1">DUE: {new Date(followUp.due_date).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <Badge className={cn(
                            "rounded-lg font-black uppercase tracking-widest px-4 py-2",
                            followUp.status === "pending" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          )}>{followUp.status}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 opacity-30">
                         <Clock className="h-12 w-12 mx-auto mb-4" />
                         <p className="font-black uppercase tracking-widest text-xs">All biologic cycles synchronized</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
