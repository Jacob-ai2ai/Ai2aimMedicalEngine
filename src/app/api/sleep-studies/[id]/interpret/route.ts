import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { sleepStudyService } from "@/lib/medical/sleep-study-service"
import { z } from "zod"

const interpretSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  recommendations: z.string().optional(),
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

    const allowedRoles = ["admin", "physician"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Only physicians can interpret studies." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = interpretSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const success = await sleepStudyService.interpretStudy(
      params.id,
      user.id,
      validation.data.diagnosis,
      validation.data.recommendations
    )

    if (!success) {
      return NextResponse.json(
        { error: "Failed to interpret study" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Study interpreted successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
