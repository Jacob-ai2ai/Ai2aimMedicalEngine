import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { dmeService } from "@/lib/medical/dme-service"
import { z } from "zod"

const assignEquipmentSchema = z.object({
  patientId: z.string().uuid(),
})

export async function POST(
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
    const validation = assignEquipmentSchema.safeParse(body)

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

    // Verify inventory item exists and is available
    const inventoryItem = await dmeService.getEquipmentBySerial("")
    const { data: inventory, error: inventoryError } = await supabase
      .from("dme_inventory")
      .select("id, status")
      .eq("id", params.id)
      .single()

    if (inventoryError || !inventory) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      )
    }

    if (inventory.status !== "available") {
      return NextResponse.json(
        {
          error: `Equipment is not available. Current status: ${inventory.status}`,
        },
        { status: 400 }
      )
    }

    const success = await dmeService.assignEquipmentToPatient(
      params.id,
      validation.data.patientId
    )

    if (!success) {
      return NextResponse.json(
        { error: "Failed to assign equipment" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Equipment assigned successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
