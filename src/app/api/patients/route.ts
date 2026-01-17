import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import {
  createPatientSchema,
  validateRequestBody,
  createValidationErrorResponse,
} from "@/lib/validation/schemas"

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const validation = await validateRequestBody(request, createPatientSchema)
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

    // Check if patient ID already exists
    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .eq("patient_id", validation.data.patientId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Patient ID already exists" },
        { status: 400 }
      )
    }

    // Create patient
    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        patient_id: validation.data.patientId,
        first_name: validation.data.firstName,
        last_name: validation.data.lastName,
        date_of_birth: validation.data.dateOfBirth || null,
        gender: validation.data.gender || null,
        phone: validation.data.phone || null,
        email: validation.data.email || null,
        address_line1: validation.data.addressLine1 || null,
        address_line2: validation.data.addressLine2 || null,
        city: validation.data.city || null,
        state: validation.data.state || null,
        zip_code: validation.data.zipCode || null,
        insurance_provider: validation.data.insuranceProvider || null,
        insurance_id: validation.data.insuranceId || null,
        emergency_contact_name: validation.data.emergencyContactName || null,
        emergency_contact_phone: validation.data.emergencyContactPhone || null,
        medical_history: validation.data.medicalHistory || null,
        allergies: validation.data.allergies || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Patient creation error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create patient" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        patient,
        message: "Patient created successfully",
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
