import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { cpapComplianceService } from "@/lib/medical/cpap-compliance-service"
import { z } from "zod"

const syncDataSchema = z.object({
  dataSource: z.enum(["resmed_cloud", "philips_care", "manual"]),
  data: z.any(), // JSON data from device
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function POST(
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

    // Check user role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["admin", "physician", "nurse", "administrative"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = syncDataSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    let success = false

    switch (validation.data.dataSource) {
      case "resmed_cloud":
        success = await cpapComplianceService.importResMedData(
          params.patientId,
          validation.data.data
        )
        break
      case "philips_care":
        success = await cpapComplianceService.importPhilipsData(
          params.patientId,
          validation.data.data
        )
        break
      case "manual":
        // Manual entry - calculate from provided data
        const dailyUsage = validation.data.data.daily_usage || []
        const daysUsed = dailyUsage.filter((d: any) => d.hours >= 4.0).length
        const totalHours = dailyUsage.reduce(
          (sum: number, d: any) => sum + (d.hours || 0),
          0
        )
        const averageHours =
          dailyUsage.length > 0 ? totalHours / dailyUsage.length : 0

        success = await cpapComplianceService.updateCompliance(
          params.patientId,
          validation.data.periodStart,
          validation.data.periodEnd,
          daysUsed,
          averageHours,
          "manual",
          validation.data.data
        )
        break
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to sync compliance data" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Compliance data synced successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
