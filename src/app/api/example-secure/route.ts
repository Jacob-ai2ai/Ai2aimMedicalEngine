/**
 * Example Secure API Route
 * Demonstrates how to use all security features
 */

import { NextRequest, NextResponse } from "next/server"
import { validateRequestBody, createPatientSchema, createValidationErrorResponse } from "@/lib/validation/schemas"
import { createServiceRoleClient } from "@/lib/supabase/client"

/**
 * GET endpoint - No CSRF required, but rate limited
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication is handled by middleware
    const supabase = createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get user profile to check role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // 3. RLS policies will automatically filter data based on user role
    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: profile,
      patients,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint - Requires CSRF token, rate limited, and input validated
 */
export async function POST(request: NextRequest) {
  try {
    // 1. CSRF validation is automatic in middleware
    // 2. Rate limiting is automatic in middleware
    
    // 3. Validate input
    const validation = await validateRequestBody(request, createPatientSchema)
    if (!validation.success) {
      return createValidationErrorResponse(validation.error)
    }

    // 4. Check authentication
    const supabase = createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 5. Check user role (optional - can also rely on RLS)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Only certain roles can create patients
    const allowedRoles = ["admin", "physician", "nurse", "administrative"]
    if (profile && !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    // 6. Create patient (RLS will enforce final permission check)
    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        ...validation.data,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // 7. Audit log is automatically created by database trigger

    return NextResponse.json(
      {
        success: true,
        patient,
        message: "Patient created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT endpoint - Update with validation
 */
export async function PUT(request: NextRequest) {
  try {
    // Get patient ID from query params
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("id")

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID required" },
        { status: 400 }
      )
    }

    // Validate input (using partial schema for updates)
    const validation = await validateRequestBody(
      request,
      createPatientSchema.partial()
    )
    if (!validation.success) {
      return createValidationErrorResponse(validation.error)
    }

    // Authentication
    const supabase = createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update patient (RLS will enforce permissions)
    const { data: patient, error } = await supabase
      .from("patients")
      .update(validation.data)
      .eq("id", patientId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      patient,
      message: "Patient updated successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE endpoint - Restricted by RLS
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("id")

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID required" },
        { status: 400 }
      )
    }

    // Authentication
    const supabase = createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete patient (only admin can delete per RLS)
    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", patientId)

    if (error) {
      // If not admin, RLS will prevent delete
      return NextResponse.json(
        { error: "Insufficient permissions or patient not found" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Patient deleted successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
