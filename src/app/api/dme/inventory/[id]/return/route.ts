import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { dmeService } from "@/lib/medical/dme-service"

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

    // Verify inventory item exists
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

    if (inventory.status !== "assigned") {
      return NextResponse.json(
        {
          error: `Equipment is not assigned. Current status: ${inventory.status}`,
        },
        { status: 400 }
      )
    }

    const success = await dmeService.returnEquipment(params.id)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to return equipment" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Equipment returned successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
