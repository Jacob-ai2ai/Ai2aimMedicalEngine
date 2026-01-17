import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { dmeService } from "@/lib/medical/dme-service"
import { z } from "zod"

const createEquipmentSchema = z.object({
  equipmentCode: z.string().min(1, "Equipment code is required"),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["cpap", "bipap", "mask", "supply", "monitor"]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  unitCost: z.number().optional(),
  rentalRateMonthly: z.number().optional(),
  requiresPrescription: z.boolean().optional(),
  insuranceCode: z.string().optional(),
})

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
    const category = searchParams.get("category") as
      | "cpap"
      | "bipap"
      | "mask"
      | "supply"
      | "monitor"
      | null
    const limit = parseInt(searchParams.get("limit") || "100")

    const equipment = await dmeService.getAvailableEquipment(category || undefined, limit)

    return NextResponse.json({
      success: true,
      equipment,
      count: equipment.length,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const allowedRoles = ["admin", "physician", "administrative"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createEquipmentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Check if equipment code already exists
    const { data: existing } = await supabase
      .from("dme_equipment")
      .select("id")
      .eq("equipment_code", validation.data.equipmentCode)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Equipment code already exists" },
        { status: 400 }
      )
    }

    const equipment = await dmeService.createEquipment({
      equipment_code: validation.data.equipmentCode,
      name: validation.data.name,
      category: validation.data.category,
      manufacturer: validation.data.manufacturer,
      model: validation.data.model,
      description: validation.data.description,
      unit_cost: validation.data.unitCost,
      rental_rate_monthly: validation.data.rentalRateMonthly,
      requires_prescription: validation.data.requiresPrescription ?? true,
      insurance_code: validation.data.insuranceCode,
    })

    if (!equipment) {
      return NextResponse.json(
        { error: "Failed to create equipment" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      equipment,
      message: "Equipment created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
