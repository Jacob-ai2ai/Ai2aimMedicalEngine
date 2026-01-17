import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { followUpService } from "@/lib/medical/follow-up-service"
import { z } from "zod"

const createFollowUpSchema = z.object({
  patientId: z.string().uuid(),
  followUpType: z.enum(["72h", "3m", "6m"]),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  encounterId: z.string().uuid().optional(),
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
    const patientId = searchParams.get("patientId")

    if (patientId) {
      const followUps = await followUpService.getPatientFollowUps(patientId)
      return NextResponse.json({
        success: true,
        followUps,
        count: followUps.length,
      })
    }

    // If no patientId, return pending follow-ups
    const limit = parseInt(searchParams.get("limit") || "50")
    const followUps = await followUpService.getPendingFollowUps(limit)

    return NextResponse.json({
      success: true,
      followUps,
      count: followUps.length,
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

    const body = await request.json()
    const validation = createFollowUpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const followUp = await followUpService.createFollowUp(
      validation.data.patientId,
      validation.data.followUpType,
      validation.data.dueDate,
      validation.data.encounterId,
      user.id
    )

    if (!followUp) {
      return NextResponse.json(
        { error: "Failed to create follow-up" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      followUp,
      message: "Follow-up created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
