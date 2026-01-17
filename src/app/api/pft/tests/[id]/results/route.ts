import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { pftService } from "@/lib/medical/pft-service"
import { z } from "zod"

const createPFTResultSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  fev1Liters: z.number().optional(),
  fev1PercentPredicted: z.number().optional(),
  fvcLiters: z.number().optional(),
  fvcPercentPredicted: z.number().optional(),
  fev1FvcRatio: z.number().optional(),
  pefLitersPerSec: z.number().optional(),
  tlcLiters: z.number().optional(),
  tlcPercentPredicted: z.number().optional(),
  rvLiters: z.number().optional(),
  rvPercentPredicted: z.number().optional(),
  frcLiters: z.number().optional(),
  frcPercentPredicted: z.number().optional(),
  vcLiters: z.number().optional(),
  vcPercentPredicted: z.number().optional(),
  dlco: z.number().optional(),
  dlcoPercentPredicted: z.number().optional(),
  ageAtTest: z.number().optional(),
  heightCm: z.number().optional(),
  weightKg: z.number().optional(),
  gender: z.string().optional(),
  testQuality: z.enum(["excellent", "good", "acceptable", "poor"]).optional(),
  bronchodilatorUsed: z.boolean().optional(),
  bronchodilatorType: z.string().optional(),
  rawData: z.any().optional(),
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

    const result = await pftService.getPFTResult(params.id)

    if (!result) {
      return NextResponse.json(
        { error: "PFT result not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      result,
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

    const allowedRoles = ["admin", "physician", "nurse"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createPFTResultSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const result = await pftService.createPFTResult({
      pft_test_id: params.id,
      patient_id: validation.data.patientId,
      fev1_liters: validation.data.fev1Liters,
      fev1_percent_predicted: validation.data.fev1PercentPredicted,
      fvc_liters: validation.data.fvcLiters,
      fvc_percent_predicted: validation.data.fvcPercentPredicted,
      fev1_fvc_ratio: validation.data.fev1FvcRatio,
      pef_liters_per_sec: validation.data.pefLitersPerSec,
      tlc_liters: validation.data.tlcLiters,
      tlc_percent_predicted: validation.data.tlcPercentPredicted,
      rv_liters: validation.data.rvLiters,
      rv_percent_predicted: validation.data.rvPercentPredicted,
      frc_liters: validation.data.frcLiters,
      frc_percent_predicted: validation.data.frcPercentPredicted,
      vc_liters: validation.data.vcLiters,
      vc_percent_predicted: validation.data.vcPercentPredicted,
      dlco: validation.data.dlco,
      dlco_percent_predicted: validation.data.dlcoPercentPredicted,
      age_at_test: validation.data.ageAtTest,
      height_cm: validation.data.heightCm,
      weight_kg: validation.data.weightKg,
      gender: validation.data.gender as "male" | "female" | undefined,
      test_quality: validation.data.testQuality,
      bronchodilator_used: validation.data.bronchodilatorUsed,
      bronchodilator_type: validation.data.bronchodilatorType,
      raw_data: validation.data.rawData,
    })

    return NextResponse.json({
      success: true,
      result,
      message: "PFT results recorded successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
