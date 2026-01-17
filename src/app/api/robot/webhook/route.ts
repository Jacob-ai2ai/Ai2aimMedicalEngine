import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { automationEngine } from "@/lib/automations"

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature if needed
    const body = await request.json()
    const { eventType, eventData, robotId } = body

    if (!eventType) {
      return NextResponse.json({ error: "Missing eventType" }, { status: 400 })
    }

    // Process webhook event through automation engine
    await automationEngine.processEvent(eventType, {
      ...eventData,
      robotId,
      source: "robot",
    })

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error("Error processing robot webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
