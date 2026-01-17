import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { agentOrchestrator } from "@/lib/ai/orchestrator"
import { agentRegistry } from "@/lib/ai/registry"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agents = agentRegistry.getAll()
    return NextResponse.json({
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        agentType: agent.agentType,
        description: agent.description,
        capabilities: agent.capabilities,
      })),
    })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    const body = await request.json()
    const { agentId, message, context } = body

    if (!agentId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fullContext = {
      userId: user.id,
      ...context,
    }

    const response = await agentOrchestrator.routeToAgent(
      agentId as any,
      message,
      fullContext
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing agent request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
