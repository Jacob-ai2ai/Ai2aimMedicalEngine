import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { z } from "zod"

const createReferralSchema = z.object({
  patientId: z.string().uuid().optional(),
  referringPhysicianName: z.string().optional(),
  referringClinicName: z.string().optional(),
  referringPhone: z.string().optional(),
  referringFax: z.string().optional(),
  referringEmail: z.string().optional(),
  referringAddress: z.string().optional(),
  referralType: z.enum([
    "sleep_study",
    "cpap_titration",
    "pft",
    "respiratory_consult",
    "dme",
  ]),
  reasonForReferral: z.string().min(1, "Reason for referral is required"),
  clinicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  referralDocumentUrl: z.string().optional(),
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
    const status = searchParams.get("status")
    const referralType = searchParams.get("type")

    let query = supabase.from("referral_forms").select("*").order("received_date", {
      ascending: false,
    })

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (referralType) {
      query = query.eq("referral_type", referralType)
    }

    const { data: referrals, error } = await query.limit(100)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      referrals: referrals || [],
      count: referrals?.length || 0,
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
    const validation = createReferralSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { data: referral, error } = await supabase
      .from("referral_forms")
      .insert({
        patient_id: validation.data.patientId,
        referring_physician_name: validation.data.referringPhysicianName,
        referring_clinic_name: validation.data.referringClinicName,
        referring_phone: validation.data.referringPhone,
        referring_fax: validation.data.referringFax,
        referring_email: validation.data.referringEmail,
        referring_address: validation.data.referringAddress,
        referral_type: validation.data.referralType,
        reason_for_referral: validation.data.reasonForReferral,
        clinical_history: validation.data.clinicalHistory,
        current_medications: validation.data.currentMedications,
        insurance_provider: validation.data.insuranceProvider,
        insurance_id: validation.data.insuranceId,
        referral_document_url: validation.data.referralDocumentUrl,
        notes: validation.data.notes,
        status: "received",
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      referral,
      message: "Referral form created successfully",
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
