import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { sleepStudyService } from "@/lib/medical/sleep-study-service"
import { z } from "zod"

const resultsSchema = z.object({
  results: z.any(), // JSONB data
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
    const validation = resultsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const success = await sleepStudyService.uploadResults(
      params.id,
      validation.data.results
    )

    if (!success) {
      return NextResponse.json(
        { error: "Failed to upload results" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Results uploaded successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
