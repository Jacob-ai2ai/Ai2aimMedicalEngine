"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Pill, Users, Mail, Settings, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/communications", label: "Messages", icon: Mail },
  { href: "/automations", label: "Automations", icon: Settings },
  { href: "/ai-agents", label: "AI Agents", icon: Bot },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 p-2 md:hidden">
      <div className="flex items-center justify-around h-16 rounded-2xl aeterna-glass border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-0 px-2 rounded-xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-foreground/40"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1 transition-all", isActive && "neural-glow")} />
              <span className="text-[9px] font-black uppercase tracking-tighter w-full text-center truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
