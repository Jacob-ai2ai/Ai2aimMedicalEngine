import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { agentRegistry } from "@/lib/ai/registry"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, communicationType } = body

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    // Get the appropriate encoding agent based on communication type
    let agentName = "Communication Encoding Agent"
    if (communicationType === "letter") {
      agentName = "Letter Encoding Agent"
    } else if (communicationType === "referral") {
      agentName = "Referral Encoding Agent"
    }

    // Get agent from registry
    const agents = agentRegistry.getAll()
    const agent = agents.find((a) => a.name === agentName)

    if (!agent) {
      return NextResponse.json(
        { error: `Encoding agent ${agentName} not found` },
        { status: 404 }
      )
    }

    // Process the content with the encoding agent
    try {
      const result = await agent.process(
        `Extract structured data from this communication:\n\n${content}`,
        {
          communicationType: communicationType || "letter",
        }
      )

      // Parse the extracted data from the agent response
      let extracted: any = {}
      try {
        // Try to extract JSON from the response
        const jsonMatch = result.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          extracted = JSON.parse(jsonMatch[0])
        } else {
          // Fallback: try to extract key information from text
          extracted = {
            subject: extractField(content, ["subject", "re:", "topic"]),
            urgency: extractField(content, ["urgent", "priority", "asap"]),
          }
        }
      } catch {
        // If parsing fails, return basic extraction
        extracted = {
          subject: extractField(content, ["subject", "re:", "topic"]),
        }
      }

      return NextResponse.json({
        success: true,
        extracted,
        rawResponse: result.content,
      })
    } catch (error: any) {
      console.error("Encoding error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to encode communication" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to extract fields from text
function extractField(
  text: string,
  keywords: string[]
): string | undefined {
  const lowerText = text.toLowerCase()
  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword.toLowerCase())
    if (index !== -1) {
      // Try to extract the value after the keyword
      const afterKeyword = text.substring(index + keyword.length).trim()
      const match = afterKeyword.match(/^:?\s*(.+?)(?:\n|$)/i)
      if (match) {
        return match[1].trim()
      }
    }
  }
  return undefined
}
