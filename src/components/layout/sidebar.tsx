"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Pill, 
  Users, 
  Mail, 
  Settings, 
  Bot, 
  Activity, 
  Menu, 
  Zap, 
  ArrowRight, 
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Search,
  Package,
  FileText,
  TrendingDown,
  Moon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClientSupabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { AgentAvatar } from "../ui/agent-avatar"
import { useSkin } from "@/components/theme/skin-provider"

const navItems = [
  { href: "/dashboard", label: "The Bridge", icon: LayoutDashboard },
  { href: "/hub", label: "Neural Hub", icon: Zap },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/communications", label: "Communications", icon: Mail },
  { href: "/specialists", label: "Specialist Hub", icon: Users },
  { href: "/inventory", label: "Inventory Matrix", icon: Settings },
  { href: "/billing", label: "Financial Matrix", icon: BarChart3 },
  { href: "/purchasing", label: "Purchasing Core", icon: Pill },
  { href: "/reports", label: "Reporting Engine", icon: Activity },
  { href: "/automations", label: "Workflow Automations", icon: Zap },
  { href: "/workflow-simulator", label: "Workflow Simulator", icon: Bot },
  { href: "/diagnostic-iq", label: "Diagnostic IQ", icon: ShieldAlert },
  // Sleep Clinic Section
  { href: "/dme/equipment", label: "DME Equipment", icon: Package, section: "sleep-clinic" },
  { href: "/dme/prescriptions", label: "DME Prescriptions", icon: FileText, section: "sleep-clinic" },
  { href: "/cpap/compliance", label: "CPAP Compliance", icon: TrendingDown, section: "sleep-clinic" },
  { href: "/sleep-studies", label: "Sleep Studies", icon: Moon, section: "sleep-clinic" },
  { href: "/pft/tests", label: "PFT Tests", icon: Activity, section: "sleep-clinic" },
  { href: "/referrals", label: "Referrals", icon: FileText, section: "sleep-clinic" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { skin } = useSkin()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const supabase = createClientSupabase()
    supabase
      .from("communications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .then(({ count }) => {
        if (count !== null) setUnreadCount(count)
      })
  }, [])

  return (
    <aside 
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 z-40 transition-all duration-700 ease-out",
        isCollapsed ? "md:w-20" : "md:w-72"
      )}
    >
      <div className={cn(
        "flex flex-col flex-1 m-3 rounded-[2rem] overflow-hidden transition-all duration-500",
        skin === "legacy"
          ? "bg-white border border-slate-100 shadow-2xl shadow-slate-200/50"
          : "aeterna-glass border border-white/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)]"
      )}>
        {/* Header with Pulse */}
        <div className={cn(
          "flex items-center h-24 px-8 border-b transition-colors duration-500",
          skin === "legacy" ? "border-slate-50 bg-slate-50/30" : "border-white/5 bg-white/[0.02]"
        )}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Activity className={cn(
                "h-8 w-8 neural-glow",
                skin === "legacy" ? "text-emerald-500" : "text-primary"
              )} />
              {skin !== "legacy" && <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h2 className={cn(
                  "text-base font-black tracking-[0.2em] uppercase",
                  skin === "legacy" ? "text-slate-900" : "text-foreground"
                )}>Aeterna OS</h2>
                <p className={cn(
                  "text-[10px] font-bold tracking-widest uppercase",
                  skin === "legacy" ? "text-emerald-600" : "text-primary/60"
                )}>Cognitive System</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Agents Support Crew */}
        <div className={cn(
          "px-6 py-8 border-b transition-colors duration-500",
          skin === "legacy" ? "border-slate-50 bg-white" : "border-white/5 bg-white/[0.01]",
          isCollapsed ? "flex flex-col items-center gap-4" : "flex flex-col gap-5"
        )}>
          {!isCollapsed && (
            <p className={cn(
              "px-2 text-[10px] font-black uppercase tracking-widest mb-1",
              skin === "legacy" ? "text-slate-300" : "text-foreground/40"
            )}>Active Agents</p>
          )}
          <div className="flex items-center gap-4">
            <AgentAvatar id="admin-1" name="Nexus" role="Admin" status="idle" />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-bold",
                  skin === "legacy" ? "text-slate-700" : "text-foreground"
                )}>Nexus</span>
                <span className={cn(
                  "text-[10px] font-medium",
                  skin === "legacy" ? "text-slate-400" : "text-foreground/40"
                )}>Monitoring Workflows</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            const showBadge = item.href === "/communications" && unreadCount > 0
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm transition-all duration-300",
                  "group relative border",
                  isActive
                    ? (skin === "legacy" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" 
                        : "bg-primary/10 text-primary border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]")
                    : (skin === "legacy"
                        ? "text-slate-400 border-transparent hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100"
                        : "text-foreground/50 border-transparent hover:text-foreground hover:bg-white/[0.03] hover:border-white/5")
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-500",
                  isActive 
                    ? (skin === "legacy" ? "text-emerald-500" : "text-primary neural-glow") 
                    : "group-hover:scale-110 group-hover:text-foreground"
                )} />
                {!isCollapsed && <span className="flex-1 font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
                {showBadge && !isCollapsed && (
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-black rounded-lg shadow-lg",
                    skin === "legacy" ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary text-primary-foreground shadow-primary/20"
                  )}>
                    {unreadCount}
                  </span>
                )}
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className={cn(
                    "absolute left-0 w-1.5 h-6 rounded-full blur-[2px]",
                    skin === "legacy" ? "bg-emerald-400" : "bg-primary"
                  )} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-5 border-t flex items-center justify-center transition-all duration-300",
            skin === "legacy" 
              ? "border-slate-50 hover:bg-slate-50 text-slate-300" 
              : "border-white/5 hover:bg-white/[0.03] text-foreground/40"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </aside>
  )
}
