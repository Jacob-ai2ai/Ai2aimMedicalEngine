// AUTH DISABLED FOR DEMO - Remove this in production
// import { redirect } from "next/navigation"
// import { createServerSupabase } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Header } from "@/components/layout/header"
import { CommandPalette } from "@/components/layout/command-palette"
import { AeternaBackground } from "@/components/ui/aeterna-background"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // AUTH DISABLED FOR DEMO - Remove this in production
  // const supabase = await createServerSupabase()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="flex min-h-screen bg-transparent selection:bg-primary/30 selection:text-white transition-colors duration-500">
      <AeternaBackground />
      
      {/* Background Neural Aurora */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 aeterna-only">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <Sidebar />
      <CommandPalette />

      <div className="flex-1 flex flex-col md:pl-20 2xl:pl-0 transition-all duration-700 h-screen overflow-hidden">
        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col relative md:ml-72 transition-all duration-700">
          <Header />
          <main className="flex-1 pb-16 md:pb-0 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  )
}
