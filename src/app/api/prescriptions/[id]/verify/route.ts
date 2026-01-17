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

    // Check user role (pharmacists and physicians can verify)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["admin", "pharmacist", "physician"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only pharmacists and physicians can verify prescriptions." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { approved, reason } = body

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Approved status is required" },
        { status: 400 }
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

    if (prescription.status !== "pending") {
      return NextResponse.json(
        { error: `Prescription is already ${prescription.status}` },
        { status: 400 }
      )
    }

    // Update prescription status
    const updateData: any = {
      status: approved ? "approved" : "rejected",
      approved_by: approved ? user.id : null,
      notes: reason || prescription.notes || null,
    }

    const { data: updated, error } = await supabase
      .from("prescriptions")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Prescription verification error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to verify prescription" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      prescription: updated,
      message: `Prescription ${approved ? "approved" : "rejected"} successfully`,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
