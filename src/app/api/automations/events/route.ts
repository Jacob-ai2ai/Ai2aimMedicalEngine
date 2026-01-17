import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { automationEngine } from "@/lib/automations"

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
    const { eventType, eventData } = body

    if (!eventType) {
      return NextResponse.json({ error: "Missing eventType" }, { status: 400 })
    }

    // Process event
    await automationEngine.processEvent(eventType, eventData || {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
