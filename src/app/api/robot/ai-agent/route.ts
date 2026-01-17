import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { agentOrchestrator } from "@/lib/ai/orchestrator"

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
    const { agentRole, message, context } = body

    if (!agentRole || !message) {
      return NextResponse.json(
        { error: "Missing agentRole or message" },
        { status: 400 }
      )
    }

    const fullContext = {
      userId: user.id,
      ...context,
    }

    const response = await agentOrchestrator.routeToAgent(
      agentRole as any,
      message,
      fullContext
    )

    return NextResponse.json({
      success: true,
      response: response.content,
      agentRole,
    })
  } catch (error) {
    console.error("Error processing robot AI agent request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
