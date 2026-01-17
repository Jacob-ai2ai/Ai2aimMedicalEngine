import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { cpapComplianceService } from "@/lib/medical/cpap-compliance-service"

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
    const patientId = searchParams.get("patientId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!patientId || !startDate || !endDate) {
      return NextResponse.json(
        {
          error: "patientId, startDate, and endDate are required",
        },
        { status: 400 }
      )
    }

    const report = await cpapComplianceService.generateComplianceReport(
      patientId,
      {
        start: new Date(startDate),
        end: new Date(endDate),
      }
    )

    if (!report) {
      return NextResponse.json(
        { error: "Compliance report not found for this period" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
