import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { z } from "zod"

const createEncounterSchema = z.object({
  patientId: z.string().uuid(),
  encounterDate: z.string(),
  encounterType: z.enum(["visit", "consultation", "follow-up", "emergency"]).optional(),
  providerId: z.string().uuid().optional(),
  specialistId: z.string().uuid().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  billingStatus: z.enum(["unbilled", "billed", "paid", "partial"]).optional(),
})

export async function POST(request: NextRequest) {
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
    const validation = createEncounterSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", validation.data.patientId)
      .single()

    if (patientError || !patient) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      )
    }

    // Create encounter
    const { data: encounter, error } = await supabase
      .from("encounters")
      .insert({
        patient_id: validation.data.patientId,
        encounter_date: validation.data.encounterDate,
        encounter_type: validation.data.encounterType || "visit",
        provider_id: validation.data.providerId || user.id,
        specialist_id: validation.data.specialistId || null,
        diagnosis: validation.data.diagnosis || null,
        notes: validation.data.notes || null,
        billing_status: validation.data.billingStatus || "unbilled",
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Encounter creation error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create encounter" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      encounter,
      message: "Encounter created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
