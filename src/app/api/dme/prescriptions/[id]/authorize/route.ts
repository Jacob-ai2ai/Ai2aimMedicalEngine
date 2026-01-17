import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { z } from "zod"

const authorizeSchema = z.object({
  authorizationNumber: z.string().min(1, "Authorization number is required"),
  authorizationExpires: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
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

    const allowedRoles = ["admin", "physician", "billing", "administrative"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = authorizeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Verify DME prescription exists
    const { data: dmePrescription, error: dmeError } = await supabase
      .from("dme_prescriptions")
      .select("*")
      .eq("id", params.id)
      .single()

    if (dmeError || !dmePrescription) {
      return NextResponse.json(
        { error: "DME prescription not found" },
        { status: 404 }
      )
    }

    // Update DME prescription with authorization
    const { data: updated, error: updateError } = await supabase
      .from("dme_prescriptions")
      .update({
        insurance_authorization_number: validation.data.authorizationNumber,
        authorization_expires: validation.data.authorizationExpires,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating authorization:", updateError)
      return NextResponse.json(
        { error: updateError.message || "Failed to update authorization" },
        { status: 400 }
      )
    }

    // Optionally update prescription status to approved
    await supabase
      .from("prescriptions")
      .update({ status: "approved" })
      .eq("id", dmePrescription.prescription_id)

    return NextResponse.json({
      success: true,
      dmePrescription: updated,
      message: "Insurance authorization updated successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
