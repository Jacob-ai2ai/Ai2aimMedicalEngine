import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { generatePrescriptionNumber } from "@/lib/medical/prescription-utils"
import { z } from "zod"

const createDMEPrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  equipmentId: z.string().uuid(),
  rentalOrPurchase: z.enum(["rental", "purchase"]).default("rental"),
  durationMonths: z.number().int().positive().optional(),
  insuranceAuthorizationNumber: z.string().optional(),
  authorizationExpires: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
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

    const allowedRoles = ["admin", "physician"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only physicians and admins can create DME prescriptions." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createDMEPrescriptionSchema.safeParse(body)

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

    // Verify equipment exists
    const { data: equipment, error: equipmentError } = await supabase
      .from("dme_equipment")
      .select("id, name")
      .eq("id", validation.data.equipmentId)
      .single()

    if (equipmentError || !equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      )
    }

    // Create prescription (using medication_id as a placeholder - we'll link via dme_prescriptions)
    // For DME, we need a different approach - create a "dummy" medication or handle differently
    // For now, we'll create the prescription with is_dme flag
    const prescriptionNumber = generatePrescriptionNumber()

    // Check if we need to create a medication entry for DME
    // Or we could modify the prescription schema to allow null medication_id for DME
    // For now, let's create a placeholder medication entry
    const { data: dmeMedication } = await supabase
      .from("medications")
      .select("id")
      .eq("name", "DME Equipment")
      .single()

    let medicationId: string
    if (dmeMedication) {
      medicationId = dmeMedication.id
    } else {
      // Create placeholder medication
      const { data: newMed, error: medError } = await supabase
        .from("medications")
        .insert({
          name: "DME Equipment",
          generic_name: "Durable Medical Equipment",
          description: "Placeholder for DME prescriptions",
        })
        .select()
        .single()

      if (medError || !newMed) {
        return NextResponse.json(
          { error: "Failed to create prescription" },
          { status: 400 }
        )
      }
      medicationId = newMed.id
    }

    // Create prescription
    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .insert({
        prescription_number: prescriptionNumber,
        patient_id: validation.data.patientId,
        medication_id: medicationId,
        dosage: equipment.name, // Use equipment name as dosage field
        quantity: 1,
        refills: 0,
        instructions: validation.data.instructions || null,
        notes: validation.data.notes || null,
        status: "pending",
        prescribed_by: user.id,
        is_dme: true,
        dme_category: "equipment",
      })
      .select()
      .single()

    if (prescriptionError || !prescription) {
      console.error("Prescription creation error:", prescriptionError)
      return NextResponse.json(
        { error: prescriptionError?.message || "Failed to create prescription" },
        { status: 400 }
      )
    }

    // Create DME prescription record
    const { data: dmePrescription, error: dmeError } = await supabase
      .from("dme_prescriptions")
      .insert({
        prescription_id: prescription.id,
        equipment_id: validation.data.equipmentId,
        rental_or_purchase: validation.data.rentalOrPurchase,
        duration_months: validation.data.durationMonths || null,
        insurance_authorization_number: validation.data.insuranceAuthorizationNumber || null,
        authorization_expires: validation.data.authorizationExpires || null,
        delivery_address: validation.data.deliveryAddress || null,
        delivery_instructions: validation.data.deliveryInstructions || null,
      })
      .select()
      .single()

    if (dmeError || !dmePrescription) {
      console.error("DME prescription creation error:", dmeError)
      // Rollback prescription creation
      await supabase.from("prescriptions").delete().eq("id", prescription.id)
      return NextResponse.json(
        { error: dmeError?.message || "Failed to create DME prescription" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      prescription,
      dmePrescription,
      message: "DME prescription created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
