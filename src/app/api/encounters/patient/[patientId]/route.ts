import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

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

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", params.patientId)
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Get encounters for patient
    const { data: encounters, error } = await supabase
      .from("encounters")
      .select(`
        *,
        providers:provider_id (
          full_name,
          email
        ),
        specialists:specialist_id (
          name,
          specialty
        )
      `)
      .eq("patient_id", params.patientId)
      .order("encounter_date", { ascending: false })

    if (error) {
      console.error("Error fetching encounters:", error)
      return NextResponse.json(
        { error: error.message || "Failed to fetch encounters" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      encounters: encounters || [],
      count: encounters?.length || 0,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
