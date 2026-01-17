import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { dmeService } from "@/lib/medical/dme-service"
import { z } from "zod"

const addInventorySchema = z.object({
  equipmentId: z.string().uuid(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpires: z.string().optional(),
  location: z.string().optional(),
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
    const equipmentId = searchParams.get("equipmentId")
    const status = searchParams.get("status")
    const patientId = searchParams.get("patientId")
    const serialNumber = searchParams.get("serialNumber")

    if (serialNumber) {
      // Get by serial number
      const equipment = await dmeService.getEquipmentBySerial(serialNumber)
      if (!equipment) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        inventory: equipment,
      })
    }

    if (patientId) {
      // Get patient's equipment
      const equipment = await dmeService.getPatientEquipment(patientId)
      return NextResponse.json({
        success: true,
        inventory: equipment,
        count: equipment.length,
      })
    }

    if (equipmentId) {
      // Get inventory for specific equipment
      const inventory = await dmeService.getInventoryForEquipment(
        equipmentId,
        status || undefined
      )
      return NextResponse.json({
        success: true,
        inventory,
        count: inventory.length,
      })
    }

    // Get stock levels
    const category = searchParams.get("category")
    const stockLevels = await dmeService.checkStockLevels(
      category || undefined
    )

    return NextResponse.json({
      success: true,
      stockLevels,
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
    const validation = addInventorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Check if serial number already exists
    if (validation.data.serialNumber) {
      const existing = await dmeService.getEquipmentBySerial(
        validation.data.serialNumber
      )
      if (existing) {
        return NextResponse.json(
          { error: "Serial number already exists" },
          { status: 400 }
        )
      }
    }

    const inventoryItem = await dmeService.addInventoryItem(
      validation.data.equipmentId,
      validation.data.serialNumber,
      validation.data.purchaseDate,
      validation.data.warrantyExpires,
      validation.data.location
    )

    if (!inventoryItem) {
      return NextResponse.json(
        { error: "Failed to add inventory item" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      inventory: inventoryItem,
      message: "Inventory item added successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
