import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { cpapComplianceService } from "@/lib/medical/cpap-compliance-service"

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get("month") // Format: YYYY-MM

    if (month) {
      // Get specific month compliance
      const monthDate = new Date(month + "-01")
      const report = await cpapComplianceService.calculateMonthlyCompliance(
        params.patientId,
        monthDate
      )

      if (!report) {
        return NextResponse.json(
          { error: "Compliance data not found for this period" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        report,
      })
    }

    // Get compliance status (current period)
    const status = await cpapComplianceService.checkInsuranceCompliance(
      params.patientId
    )

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
