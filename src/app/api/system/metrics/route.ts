import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { WorkflowService } from "@/lib/workflow/service"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate System IQ based on various metrics
    // This is a placeholder - in production, this would be a more sophisticated calculation
    const workflowService = WorkflowService.getInstance()
    const activeThreads = workflowService.getActiveThreadCount()

    // Calculate System IQ (0-200 scale) based on:
    // - Data integrity
    // - System performance
    // - Active workflows
    // - Error rates
    // For now, using a placeholder calculation
    const systemIQ = Math.min(200, 150 + Math.floor(activeThreads * 2))

    // Check machinery status (robot API)
    let machineryStatus = "ONLINE"
    try {
      const robotResponse = await fetch(`${process.env.ROBOT_API_URL || "http://localhost:3001"}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (robotResponse.ok) {
        const robotData = await robotResponse.json()
        machineryStatus = robotData.status || "ONLINE"
      }
    } catch (error) {
      // If robot API is not available, default to ONLINE
      machineryStatus = "ONLINE"
    }

    return NextResponse.json({
      success: true,
      systemIQ,
      activeThreads,
      machineryStatus,
    })
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
