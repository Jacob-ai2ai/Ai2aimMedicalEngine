import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Plus, Search, Users } from "lucide-react"
import { PatientCard } from "@/components/medical/patient-card"

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { search?: string, skin?: string }
}) {
  const supabase = await createServerSupabase()
  // Note: We need to get the skin from the cookie or header since this is a server component
  // However, for now we will rely on client-side skinning via CSS variables where possible.
  // But for the page background, we can use a wrapper that detects skin.
  
  let query = supabase
    .from("patients")
    .select("*")
    .order("last_name", { ascending: true })
    .limit(100)

  if (searchParams.search) {
    query = query.or(
      `first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%,patient_id.ilike.%${searchParams.search}%`
    )
  }

  const { data: patients } = await query

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                Patient Matrix
             </span>
             <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Core Database
             </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-foreground">
            Neural <span className="text-primary neural-glow">Registry</span>
          </h1>
          <p className="text-base font-medium text-foreground/50">
            Comprehensive Management of Biometric Records & Clinical Profiles
          </p>
        </div>
        <Button asChild size="lg" className="rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-primary text-white font-bold px-10 h-14">
          <Link href="/patients/new">
            <Plus className="h-5 w-5 mr-3" />
            REGISTER PATIENT
          </Link>
        </Button>
      </div>

      {/* Search & Intelligence Layer */}
      <Card className="rounded-[2rem] border-none bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden skin-legacy:bg-white skin-legacy:shadow-slate-200/50 skin-legacy:border skin-legacy:border-slate-100">
        <CardContent className="p-8">
          <form method="get" className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input
                name="search"
                placeholder="Query by Name, Biological ID, or Neural Link..."
                className="pl-14 h-14 rounded-2xl bg-black/40 border-white/5 text-white focus:border-primary/50 transition-all font-medium skin-legacy:bg-slate-50 skin-legacy:border-slate-100 skin-legacy:text-slate-900"
                defaultValue={searchParams.search}
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" size="lg" className="rounded-2xl h-14 px-10 font-black tracking-widest uppercase bg-primary text-white hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/20">
                EXECUTE SEARCH
              </Button>
              {searchParams.search && (
                <Button variant="outline" size="lg" asChild className="rounded-2xl h-14 px-8 font-black tracking-widest uppercase border-white/10 hover:bg-white/5 text-foreground/60 transition-all skin-legacy:border-slate-200 skin-legacy:hover:bg-slate-50">
                  <Link href="/patients">CLEAR</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Status Indicators (Optional) */}
      <div className="flex items-center gap-6 pb-2">
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Verified</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Sync</span>
         </div>
      </div>

      {/* Patients Grid */}
      {patients && patients.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.02] skin-legacy:bg-slate-50 skin-legacy:border-slate-200">
          <div className="max-w-md mx-auto space-y-8">
            <div className="relative mx-auto w-24 h-24">
               <Users className="h-24 w-24 text-foreground/10 mx-auto" />
               <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
            </div>
            <div className="space-y-3">
               <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Vortex Empty</h3>
               <p className="text-base text-foreground/40 font-medium leading-relaxed px-6">
                {searchParams.search
                  ? "Zero matches detected in the Neural Registry. Adjust your query parameters or verify the biological ID."
                  : "The registry currently holds zero biological records. Initiate the first patient registration to begin uplink."}
              </p>
            </div>
            <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-bold tracking-widest bg-primary text-white">
              <Link href="/patients/new">
                <Plus className="h-5 w-5 mr-3" />
                INITIATE REGISTRATION
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {patients && patients.length > 0 && (
        <div className="text-center py-10 border-t border-white/5 skin-legacy:border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
            Aeterna Indexing: {patients.length} Cognitive Identity Module{patients.length !== 1 ? "s" : ""} Loaded
          </p>
        </div>
      )}
    </div>
  )
}
