import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { diagnosticService } from "@/lib/medical/diagnostic-service"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") as "Open" | "Resolved" | "Investigating" | undefined
    const limit = parseInt(searchParams.get("limit") || "50")

    const audits = await diagnosticService.getDiagnosticAudits(status, limit)

    return NextResponse.json({
      success: true,
      audits,
      count: audits.length,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
