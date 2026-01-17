import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import {
  createPrescriptionSchema,
  validateRequestBody,
  createValidationErrorResponse,
} from "@/lib/validation/schemas"

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const validation = await validateRequestBody(request, createPrescriptionSchema)
    if (!validation.success) {
      return createValidationErrorResponse(validation.error)
    }

    // Check authentication
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check user role (physicians and admins can create prescriptions)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["admin", "physician"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only physicians and admins can create prescriptions." },
        { status: 403 }
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

    // Verify medication exists
    const { data: medication, error: medicationError } = await supabase
      .from("medications")
      .select("id")
      .eq("id", validation.data.medicationId)
      .single()

    if (medicationError || !medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      )
    }

    // Check if prescription number already exists
    const { data: existing } = await supabase
      .from("prescriptions")
      .select("id")
      .eq("prescription_number", validation.data.prescriptionNumber)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Prescription number already exists" },
        { status: 400 }
      )
    }

    // Create prescription
    const { data: prescription, error } = await supabase
      .from("prescriptions")
      .insert({
        prescription_number: validation.data.prescriptionNumber,
        patient_id: validation.data.patientId,
        medication_id: validation.data.medicationId,
        dosage: validation.data.dosage,
        quantity: validation.data.quantity,
        refills: validation.data.refills || 0,
        instructions: validation.data.instructions || null,
        notes: validation.data.notes || null,
        expires_at: validation.data.expiresAt || null,
        status: "pending",
        prescribed_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Prescription creation error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create prescription" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        prescription,
        message: "Prescription created successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
