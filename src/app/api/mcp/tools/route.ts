import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { mcpClient, registerMedicalTools } from "@/lib/ai/mcp"

// Initialize medical tools
registerMedicalTools(mcpClient)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to list tools from MCP server, fallback to registered tools
    const tools = await mcpClient.listTools()
    const toolDefinitions = mcpClient.getToolDefinitions()

    return NextResponse.json({
      tools: toolDefinitions,
      count: toolDefinitions.length,
    })
  } catch (error) {
    console.error("Error fetching tools:", error)
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
    const { toolName, arguments: toolArgs } = body

    if (!toolName) {
      return NextResponse.json({ error: "Missing toolName" }, { status: 400 })
    }

    // Execute tool via MCP client
    const result = await mcpClient.executeTool({
      id: `tool_${Date.now()}`,
      name: toolName,
      arguments: toolArgs || {},
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error executing tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
