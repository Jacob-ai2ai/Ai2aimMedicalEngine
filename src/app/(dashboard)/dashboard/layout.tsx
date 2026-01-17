// AUTH DISABLED FOR DEMO - Remove this in production
// import { redirect } from "next/navigation"
// import { createServerSupabase } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // AUTH DISABLED FOR DEMO
  // const supabase = await createServerSupabase()
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return <>{children}</>
}
