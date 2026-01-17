import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { followUpService } from "@/lib/medical/follow-up-service"

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

    const body = await request.json()
    const { notes } = body

    const success = await followUpService.completeFollowUp(params.id, notes)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to complete follow-up" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Follow-up marked as completed",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
