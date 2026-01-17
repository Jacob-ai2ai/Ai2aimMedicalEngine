import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { z } from "zod"

const updateReferralSchema = z.object({
  status: z
    .enum(["received", "reviewed", "scheduled", "completed", "cancelled"])
    .optional(),
  reviewedBy: z.string().uuid().optional(),
  scheduledDate: z.string().optional(),
  linkedSleepStudyId: z.string().uuid().optional(),
  linkedPftTestId: z.string().uuid().optional(),
  linkedPrescriptionId: z.string().uuid().optional(),
  notes: z.string().optional(),
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

    const { data: referral, error } = await supabase
      .from("referral_forms")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Referral not found" },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      referral,
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

    const allowedRoles = ["admin", "physician", "nurse", "administrative"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = updateReferralSchema.safeParse(body)

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

    if (validation.data.status) {
      updateData.status = validation.data.status
      if (validation.data.status === "reviewed" && validation.data.reviewedBy) {
        updateData.reviewed_by = validation.data.reviewedBy
        updateData.reviewed_date = new Date().toISOString().split("T")[0]
      }
    }

    if (validation.data.scheduledDate) {
      updateData.scheduled_date = validation.data.scheduledDate
    }

    if (validation.data.linkedSleepStudyId) {
      updateData.linked_sleep_study_id = validation.data.linkedSleepStudyId
    }

    if (validation.data.linkedPftTestId) {
      updateData.linked_pft_test_id = validation.data.linkedPftTestId
    }

    if (validation.data.linkedPrescriptionId) {
      updateData.linked_prescription_id = validation.data.linkedPrescriptionId
    }

    if (validation.data.notes !== undefined) {
      updateData.notes = validation.data.notes
    }

    const { data: referral, error } = await supabase
      .from("referral_forms")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      referral,
      message: "Referral updated successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
