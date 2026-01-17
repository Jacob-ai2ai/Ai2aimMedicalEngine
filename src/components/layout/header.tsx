"use client"

import { createClientSupabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bell, Cpu, Zap, Activity, Loader2, Monitor, Layers } from "lucide-react"
import { useEffect, useState } from "react"
import { useSkin } from "@/components/theme/skin-provider"
import { cn } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const { skin, toggleSkin } = useSkin()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [systemIQ, setSystemIQ] = useState(184)
  const [activeThreads, setActiveThreads] = useState(12)
  const [machineryStatus, setMachineryStatus] = useState("ONLINE")

  useEffect(() => {
    const supabase = createClientSupabase()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    // Fetch system metrics
    async function fetchMetrics() {
      try {
        // Fetch System IQ (could be calculated from various metrics)
        // For now, we'll use a placeholder calculation
        const response = await fetch("/api/system/metrics")
        if (response.ok) {
          const data = await response.json()
          setSystemIQ(data.systemIQ || 184)
          setActiveThreads(data.activeThreads || 12)
          setMachineryStatus(data.machineryStatus || "ONLINE")
        }
      } catch (error) {
        console.error("Error fetching system metrics:", error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClientSupabase()
    await supabase.auth.signOut()
    router.push("/auth/login")
    setIsLoggingOut(false) // This might not be reached if router.push causes a full page reload
  }

  return (
    <header className={cn(
      "h-20 border-b sticky top-0 z-30 transition-all duration-500",
      skin === "legacy" 
        ? "bg-white/80 border-slate-100 backdrop-blur-xl shadow-sm" 
        : "bg-background/40 border-white/5 backdrop-blur-md"
    )}>
      <div className="container mx-auto px-8 h-full flex items-center justify-between max-w-[1600px]">
        <div className="flex items-center gap-6">
          <div className={cn(
            "flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all duration-500",
            skin === "legacy" ? "bg-emerald-50 border-emerald-100/50" : "bg-primary/5 border-primary/20"
          )}>
            <Cpu className={cn(
              "h-4 w-4 animate-pulse",
              skin === "legacy" ? "text-emerald-500" : "text-primary"
            )} />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-emerald-600" : "text-primary"
            )}>
              System IQ: {systemIQ}
            </span>
          </div>
          <div className={cn(
            "hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all duration-500",
            skin === "legacy" ? "bg-violet-50 border-violet-100/50" : "bg-secondary/5 border-secondary/20"
          )}>
            <Zap className={cn(
              "h-4 w-4",
              skin === "legacy" ? "text-violet-500" : "text-secondary"
            )} />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-violet-600" : "text-secondary"
            )}>
              Active Threads: {activeThreads}
            </span>
          </div>
          <div className={cn(
            "hidden xl:flex items-center gap-2.5 px-4 py-1.5 rounded-full border transition-all duration-500",
            skin === "legacy" ? "bg-slate-50 border-slate-100/50" : "bg-orange-500/5 border-orange-500/20"
          )}>
            <Activity className={cn(
              "h-4 w-4",
              skin === "legacy" ? "text-slate-400" : "text-orange-500"
            )} />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-slate-500" : "text-orange-500"
            )}>
              Machinery: {machineryStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Console Skin Toggle */}
          <button
            onClick={toggleSkin}
            className={cn(
              "group flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-500 border",
              skin === "legacy" 
                ? "bg-slate-50 border-slate-100 hover:border-emerald-200 text-slate-600 hover:text-emerald-600" 
                : "bg-white/5 border-white/10 hover:border-primary/50 text-foreground/60 hover:text-primary"
            )}
            title={`Switch to ${skin === "aeterna" ? "Legacy" : "Aeterna"} Skin`}
            aria-label={`Switch to ${skin === "aeterna" ? "Legacy" : "Aeterna"} Skin`}
          >
            {skin === "aeterna" ? (
              <>
                <Monitor className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Aeterna</span>
              </>
            ) : (
              <>
                <Layers className="h-4 w-4 group-hover:scale-110 transition-transform text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Legacy</span>
              </>
            )}
          </button>

          <Button variant="ghost" size="icon" aria-label="Notifications" className={cn(
            "relative rounded-2xl transition-all duration-300 w-10 h-10",
            skin === "legacy" ? "hover:bg-slate-50 text-slate-400" : "hover:bg-white/5 text-foreground/70"
          )}>
            <Bell className="h-5 w-5" />
            <span className={cn(
              "absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2",
              skin === "legacy" ? "bg-emerald-500 border-white" : "bg-primary border-background neural-glow"
            )} />
          </Button>
          
          <div className={cn(
            "h-6 w-[1px] mx-2",
            skin === "legacy" ? "bg-slate-100" : "bg-white/10"
          )} />

          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300 cursor-pointer group border",
            skin === "legacy" 
              ? "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50" 
              : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
          )}>
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500",
              skin === "legacy" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                : "bg-gradient-to-br from-primary/20 to-secondary/20 border-white/10 text-foreground/80"
            )}>
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className={cn(
                "text-[11px] font-black tracking-tight",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>
                {user?.email?.split('@')[0]}
              </span>
              <span className={cn(
                "text-[9px] uppercase tracking-widest font-black",
                skin === "legacy" ? "text-slate-300" : "text-foreground/40"
              )}>
                Administrator
              </span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout} 
            aria-label="Log out" 
            className={cn(
              "rounded-2xl transition-all duration-300 w-10 h-10",
              skin === "legacy" ? "hover:bg-red-50 text-red-400" : "hover:bg-red-500/10 text-red-400"
            )}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
