import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
      .eq("id", params.id)
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Fetch all related data
    const [prescriptions, communications, encounters, followUps] = await Promise.all([
      // Prescriptions
      supabase
        .from("prescriptions")
        .select(`
          *,
          medications:medication_id (
            name,
            generic_name,
            dosage_form
          )
        `)
        .eq("patient_id", params.id)
        .order("created_at", { ascending: false }),

      // Communications
      supabase
        .from("communications")
        .select("*")
        .eq("patient_id", params.id)
        .order("created_at", { ascending: false }),

      // Encounters
      supabase
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
        .eq("patient_id", params.id)
        .order("encounter_date", { ascending: false }),

      // Follow-ups
      supabase
        .from("follow_ups")
        .select("*")
        .eq("patient_id", params.id)
        .order("due_date", { ascending: false }),
    ])

    return NextResponse.json({
      success: true,
      patient: {
        id: params.id,
      },
      history: {
        prescriptions: prescriptions.data || [],
        communications: communications.data || [],
        encounters: encounters.data || [],
        followUps: followUps.data || [],
      },
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
