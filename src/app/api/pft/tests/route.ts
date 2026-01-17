import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { pftService } from "@/lib/medical/pft-service"
import { z } from "zod"

const createPFTTestSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
  testType: z.enum(["spirometry", "lung_volume", "diffusion_capacity", "full_pft"]),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  orderedBy: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  indication: z.string().optional(),
  notes: z.string().optional(),
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
    const locationId = searchParams.get("locationId")
    const status = searchParams.get("status")

    if (patientId) {
      const tests = await pftService.getPatientPFTTests(patientId)
      return NextResponse.json({
        success: true,
        tests,
        count: tests.length,
      })
    }

    if (status === "scheduled") {
      const tests = await pftService.getScheduledTests(locationId || undefined)
      return NextResponse.json({
        success: true,
        tests,
        count: tests.length,
      })
    }

    // Get all tests (with pagination in production)
    const { data: tests, error } = await supabase
      .from("pft_tests")
      .select(`
        *,
        location:clinic_locations(*)
      `)
      .order("test_date", { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      tests: tests || [],
      count: tests?.length || 0,
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
    const validation = createPFTTestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const test = await pftService.createPFTTest({
      patient_id: validation.data.patientId,
      test_type: validation.data.testType,
      test_date: validation.data.testDate,
      ordered_by: validation.data.orderedBy || user.id,
      location_id: validation.data.locationId,
      indication: validation.data.indication,
      notes: validation.data.notes,
    })

    return NextResponse.json({
      success: true,
      test,
      message: "PFT test scheduled successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
