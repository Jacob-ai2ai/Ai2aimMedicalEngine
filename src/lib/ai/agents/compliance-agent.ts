import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export class ComplianceAgent extends BaseAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "regulatory_compliance",
        description: "Ensure regulatory compliance",
        enabled: true,
      },
      {
        name: "audit_conduct",
        description: "Conduct compliance audits",
        enabled: true,
      },
      {
        name: "quality_monitoring",
        description: "Monitor quality metrics",
        enabled: true,
      },
      {
        name: "compliance_reporting",
        description: "Generate compliance reports",
        enabled: true,
      },
    ]

    super(
      id,
      "Compliance Agent",
      "compliance",
      "role_based",
      "AI agent specialized in regulatory compliance, audits, and quality assurance",
      capabilities,
      {
        systemPrompt:
          "You are a compliance AI agent. Your role is to ensure regulatory compliance, conduct audits, monitor quality metrics, and identify potential compliance issues. Be thorough, objective, and maintain high standards.",
        temperature: 0.7,
        maxTokens: 2000,
      }
    )
  }

  async process(input: string, context: AgentContext): Promise<AgentMessage> {
    await this.updateState(context.sessionId || "", {
      status: "processing",
    })

    try {
      const messages: AgentMessage[] = [
        {
          role: "system",
          content: this.config.systemPrompt || "",
        },
        {
          role: "user",
          content: input,
          timestamp: new Date().toISOString(),
        },
      ]

      const response = await this.callLLM(messages)

      await this.updateState(context.sessionId || "", {
        status: "idle",
        messages: [...messages, response],
      })

      return response
    } catch (error) {
      await this.updateState(context.sessionId || "", {
        status: "error",
      })
      throw error
    }
  }
}
