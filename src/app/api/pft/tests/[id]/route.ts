import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { pftService } from "@/lib/medical/pft-service"
import { z } from "zod"

const updatePFTTestSchema = z.object({
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
  performedBy: z.string().uuid().optional(),
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

    const test = await pftService.getPFTTest(params.id)

    if (!test) {
      return NextResponse.json(
        { error: "PFT test not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      test,
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
    const validation = updatePFTTestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    if (validation.data.status) {
      const success = await pftService.updatePFTTestStatus(
        params.id,
        validation.data.status,
        validation.data.performedBy
      )

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update test status" },
          { status: 400 }
        )
      }
    }

    if (validation.data.notes !== undefined) {
      const { error } = await supabase
        .from("pft_tests")
        .update({ notes: validation.data.notes })
        .eq("id", params.id)

      if (error) {
        throw error
      }
    }

    const updatedTest = await pftService.getPFTTest(params.id)

    return NextResponse.json({
      success: true,
      test: updatedTest,
      message: "PFT test updated successfully",
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

    // Check user role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const allowedRoles = ["admin", "physician"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("pft_tests")
      .delete()
      .eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "PFT test deleted successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
