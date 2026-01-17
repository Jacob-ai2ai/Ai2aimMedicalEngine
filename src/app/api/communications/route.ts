import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import {
  createCommunicationSchema,
  validateRequestBody,
  createValidationErrorResponse,
} from "@/lib/validation/schemas"

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const validation = await validateRequestBody(request, createCommunicationSchema)
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

    // Verify patient exists if provided
    if (validation.data.patientId) {
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
    }

    // Verify recipient exists if provided
    if (validation.data.toUserId) {
      const { data: recipient, error: recipientError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", validation.data.toUserId)
        .single()

      if (recipientError || !recipient) {
        return NextResponse.json(
          { error: "Recipient not found" },
          { status: 404 }
        )
      }
    }

    // Verify related prescription exists if provided
    if (validation.data.relatedPrescriptionId) {
      const { data: prescription, error: prescriptionError } = await supabase
        .from("prescriptions")
        .select("id")
        .eq("id", validation.data.relatedPrescriptionId)
        .single()

      if (prescriptionError || !prescription) {
        return NextResponse.json(
          { error: "Prescription not found" },
          { status: 404 }
        )
      }
    }

    // Create communication
    const { data: communication, error } = await supabase
      .from("communications")
      .insert({
        communication_type: validation.data.communicationType,
        direction: validation.data.direction,
        subject: validation.data.subject || null,
        content: validation.data.content,
        patient_id: validation.data.patientId || null,
        from_user_id: validation.data.direction === "inbound" ? null : user.id,
        to_user_id: validation.data.toUserId || null,
        related_prescription_id: validation.data.relatedPrescriptionId || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Communication creation error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create communication" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        communication,
        message: "Communication created successfully",
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
