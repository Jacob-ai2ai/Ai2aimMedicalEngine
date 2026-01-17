import { BaseEncodingAgent } from "./base-encoding-agent"
import { AgentContext, AgentCapability } from "@/types/ai"

export class CommunicationEncodingAgent extends BaseEncodingAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "communication_categorization",
        description: "Categorize communications",
        enabled: true,
      },
      {
        name: "information_extraction",
        description: "Extract relevant information",
        enabled: true,
      },
      {
        name: "urgency_assessment",
        description: "Assess communication urgency",
        enabled: true,
      },
      {
        name: "routing",
        description: "Route communications appropriately",
        enabled: true,
      },
    ]

    super(
      id,
      "Communication Encoding Agent",
      "AI agent specialized in categorizing and encoding communications",
      capabilities
    )
  }

  async extractStructuredData(
    content: string,
    context: AgentContext
  ): Promise<Record<string, unknown>> {
    return {
      type: "communication",
      category: this.categorizeCommunication(content),
      urgency: this.assessUrgency(content),
      keyInformation: this.extractKeyInformation(content),
      requiresResponse: this.requiresResponse(content),
      suggestedRecipient: this.suggestRecipient(content, context),
      extractedAt: new Date().toISOString(),
    }
  }

  private categorizeCommunication(content: string): string {
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes("question") || lowerContent.includes("?")) {
      return "question"
    }
    if (lowerContent.includes("complaint") || lowerContent.includes("issue")) {
      return "complaint"
    }
    if (lowerContent.includes("request")) {
      return "request"
    }
    if (lowerContent.includes("update") || lowerContent.includes("status")) {
      return "update"
    }
    return "general"
  }

  private assessUrgency(content: string): "low" | "medium" | "high" {
    const urgentKeywords = ["urgent", "asap", "immediate", "emergency", "critical"]
    const lowerContent = content.toLowerCase()
    if (urgentKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "high"
    }
    if (lowerContent.includes("soon") || lowerContent.includes("important")) {
      return "medium"
    }
    return "low"
  }

  private extractKeyInformation(content: string): string[] {
    // Extract key information - in production, use LLM
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20)
    return sentences.slice(0, 3)
  }

  private requiresResponse(content: string): boolean {
    const responseKeywords = ["please", "request", "need", "would like", "can you"]
    const lowerContent = content.toLowerCase()
    return responseKeywords.some((keyword) => lowerContent.includes(keyword))
  }

  private suggestRecipient(content: string, context: AgentContext): string | null {
    // Suggest appropriate recipient based on content
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes("prescription") || lowerContent.includes("medication")) {
      return "pharmacist"
    }
    if (lowerContent.includes("billing") || lowerContent.includes("payment")) {
      return "billing"
    }
    if (lowerContent.includes("appointment") || lowerContent.includes("schedule")) {
      return "administrative"
    }
    return null
  }
}
