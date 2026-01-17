import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export class BillingAgent extends BaseAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "insurance_verification",
        description: "Verify insurance coverage",
        enabled: true,
      },
      {
        name: "claim_processing",
        description: "Process insurance claims",
        enabled: true,
      },
      {
        name: "billing_management",
        description: "Manage billing and invoices",
        enabled: true,
      },
      {
        name: "payment_processing",
        description: "Handle payment processing",
        enabled: true,
      },
    ]

    super(
      id,
      "Billing Agent",
      "billing",
      "role_based",
      "AI agent specialized in insurance processing, billing, and payment management",
      capabilities,
      {
        systemPrompt:
          "You are a billing AI agent. Your role is to process insurance claims, manage billing, verify coverage, and handle payment processing. Be accurate, efficient, and ensure compliance with billing regulations.",
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
