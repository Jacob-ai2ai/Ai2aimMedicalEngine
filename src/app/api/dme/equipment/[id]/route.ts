import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { dmeService } from "@/lib/medical/dme-service"
import { z } from "zod"

const updateEquipmentSchema = z.object({
  name: z.string().optional(),
  category: z.enum(["cpap", "bipap", "mask", "supply", "monitor"]).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  unitCost: z.number().optional(),
  rentalRateMonthly: z.number().optional(),
  requiresPrescription: z.boolean().optional(),
  insuranceCode: z.string().optional(),
})

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

    const equipment = await dmeService.getEquipmentById(params.id)

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      equipment,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const allowedRoles = ["admin", "physician", "administrative"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = updateEquipmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (validation.data.name) updateData.name = validation.data.name
    if (validation.data.category) updateData.category = validation.data.category
    if (validation.data.manufacturer !== undefined)
      updateData.manufacturer = validation.data.manufacturer
    if (validation.data.model !== undefined) updateData.model = validation.data.model
    if (validation.data.description !== undefined)
      updateData.description = validation.data.description
    if (validation.data.unitCost !== undefined)
      updateData.unit_cost = validation.data.unitCost
    if (validation.data.rentalRateMonthly !== undefined)
      updateData.rental_rate_monthly = validation.data.rentalRateMonthly
    if (validation.data.requiresPrescription !== undefined)
      updateData.requires_prescription = validation.data.requiresPrescription
    if (validation.data.insuranceCode !== undefined)
      updateData.insurance_code = validation.data.insuranceCode

    const { data: equipment, error } = await supabase
      .from("dme_equipment")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating equipment:", error)
      return NextResponse.json(
        { error: error.message || "Failed to update equipment" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      equipment,
      message: "Equipment updated successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check user role (only admins can delete)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile && profile.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions. Only admins can delete equipment." },
        { status: 403 }
      )
    }

    // Check if equipment has inventory items
    const { data: inventory } = await supabase
      .from("dme_inventory")
      .select("id")
      .eq("equipment_id", params.id)
      .limit(1)

    if (inventory && inventory.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete equipment with existing inventory items. Remove inventory items first.",
        },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("dme_equipment")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("Error deleting equipment:", error)
      return NextResponse.json(
        { error: error.message || "Failed to delete equipment" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Equipment deleted successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
