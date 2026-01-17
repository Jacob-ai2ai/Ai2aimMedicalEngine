import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Robot status endpoint
    return NextResponse.json({
      status: "online",
      capabilities: [
        "prescription_management",
        "patient_interaction",
        "medication_dispensing",
        "data_collection",
        "ai_agent_integration",
      ],
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching robot status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
