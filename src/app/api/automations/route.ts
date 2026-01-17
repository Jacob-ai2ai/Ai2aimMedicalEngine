import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { automationEngine } from "@/lib/automations"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const automations = await automationEngine.getActiveAutomations()

    return NextResponse.json({ automations })
  } catch (error) {
    console.error("Error fetching automations:", error)
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
    const { automationId, context } = body

    if (!automationId) {
      return NextResponse.json({ error: "Missing automationId" }, { status: 400 })
    }

    // Get automation
    const { data: automation } = await supabase
      .from("automations")
      .select("*")
      .eq("id", automationId)
      .single()

    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 })
    }

    const automationObj = {
      id: automation.id,
      name: automation.name,
      description: automation.description,
      trigger: automation.trigger_config as any,
      action: automation.action_config as any,
      isActive: automation.is_active,
      priority: automation.priority,
      createdAt: automation.created_at,
      updatedAt: automation.updated_at,
    }

    const run = await automationEngine.executeAutomation(automationObj, context)

    return NextResponse.json({ run })
  } catch (error) {
    console.error("Error executing automation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
