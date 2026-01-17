import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { pftService } from "@/lib/medical/pft-service"
import { z } from "zod"

const createInterpretationSchema = z.object({
  pftResultId: z.string().uuid("Invalid result ID"),
  interpretedBy: z.string().uuid("Invalid user ID"),
  overallPattern: z
    .enum(["normal", "obstructive", "restrictive", "mixed", "airway_obstruction"])
    .optional(),
  severity: z.enum(["mild", "moderate", "moderate_severe", "severe"]).optional(),
  diagnosis: z.string().optional(),
  recommendations: z.string().optional(),
  followUpRequired: z.boolean().optional(),
  followUpDate: z.string().optional(),
  findings: z.any().optional(),
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

    const interpretation = await pftService.getPFTInterpretation(params.id)

    if (!interpretation) {
      return NextResponse.json(
        { error: "PFT interpretation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      interpretation,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const allowedRoles = ["admin", "physician"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createInterpretationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Auto-interpret if pattern/severity not provided
    let interpretationData = { ...validation.data }
    if (!interpretationData.overallPattern || !interpretationData.severity) {
      const result = await pftService.getPFTResult(params.id)
      if (result) {
        const autoInterpret = pftService.interpretResults(result)
        interpretationData.overallPattern =
          interpretationData.overallPattern || autoInterpret.pattern
        interpretationData.severity =
          interpretationData.severity || autoInterpret.severity
        interpretationData.diagnosis =
          interpretationData.diagnosis || autoInterpret.diagnosis
      }
    }

    const interpretation = await pftService.createPFTInterpretation({
      pft_test_id: params.id,
      pft_result_id: validation.data.pftResultId,
      interpreted_by: validation.data.interpretedBy,
      overall_pattern: interpretationData.overallPattern,
      severity: interpretationData.severity,
      diagnosis: interpretationData.diagnosis,
      recommendations: interpretationData.recommendations,
      follow_up_required: interpretationData.followUpRequired,
      follow_up_date: interpretationData.followUpDate,
      findings: interpretationData.findings,
      notes: interpretationData.notes,
    })

    return NextResponse.json({
      success: true,
      interpretation,
      message: "PFT interpretation created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
