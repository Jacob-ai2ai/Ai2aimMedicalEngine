import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { sleepStudyService } from "@/lib/medical/sleep-study-service"
import { z } from "zod"

const createStudySchema = z.object({
  patientId: z.string().uuid(),
  studyType: z.enum(["level3_home", "level1_psg", "level2_home"]),
  studyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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
    const status = searchParams.get("status")

    if (patientId) {
      const studies = await sleepStudyService.getPatientSleepStudies(patientId)
      return NextResponse.json({
        success: true,
        studies,
        count: studies.length,
      })
    }

    if (status === "pending") {
      const studies = await sleepStudyService.getPendingStudies()
      return NextResponse.json({
        success: true,
        studies,
        count: studies.length,
      })
    }

    return NextResponse.json({
      error: "Please provide patientId or status=pending",
    }, { status: 400 })
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
    const validation = createStudySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const study = await sleepStudyService.createSleepStudy(
      validation.data.patientId,
      validation.data.studyType,
      user.id,
      validation.data.studyDate
    )

    if (!study) {
      return NextResponse.json(
        { error: "Failed to create sleep study" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      study,
      message: "Sleep study created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
