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
    const daysThreshold = parseInt(searchParams.get("daysThreshold") || "21")

    const nonCompliant = await cpapComplianceService.getNonCompliantPatients(
      daysThreshold
    )

    // Get patient details for each
    const patientIds = nonCompliant.map((nc) => nc.patient_id)
    const { data: patients } = await supabase
      .from("patients")
      .select("id, first_name, last_name, patient_id")
      .in("id", patientIds)

    const result = nonCompliant.map((nc) => {
      const patient = patients?.find((p) => p.id === nc.patient_id)
      return {
        ...nc,
        patient: patient
          ? {
              id: patient.id,
              name: `${patient.first_name} ${patient.last_name}`,
              patient_id: patient.patient_id,
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      nonCompliant: result,
      count: result.length,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
