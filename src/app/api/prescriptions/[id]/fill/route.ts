import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function PATCH(
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

    // Check user role (pharmacists can fill prescriptions)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["admin", "pharmacist"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only pharmacists can fill prescriptions." },
        { status: 403 }
      )
    }

    // Get current prescription
    const { data: prescription, error: fetchError } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      )
    }

    if (prescription.status !== "approved") {
      return NextResponse.json(
        { error: `Prescription must be approved before filling. Current status: ${prescription.status}` },
        { status: 400 }
      )
    }

    // Update prescription status to filled
    const { data: updated, error } = await supabase
      .from("prescriptions")
      .update({
        status: "filled",
        filled_by: user.id,
        filled_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Prescription fill error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to fill prescription" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      prescription: updated,
      message: "Prescription filled successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
