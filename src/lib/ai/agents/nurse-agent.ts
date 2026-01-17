import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export class NurseAgent extends BaseAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "care_coordination",
        description: "Coordinate patient care activities",
        enabled: true,
      },
      {
        name: "patient_follow_up",
        description: "Conduct patient follow-ups",
        enabled: true,
      },
      {
        name: "care_planning",
        description: "Assist with care planning",
        enabled: true,
      },
      {
        name: "patient_education",
        description: "Provide patient education",
        enabled: true,
      },
    ]

    super(
      id,
      "Nurse Agent",
      "nurse",
      "role_based",
      "AI agent specialized in patient care coordination, follow-ups, and care planning",
      capabilities,
      {
        systemPrompt:
          "You are a registered nurse AI agent. Your role is to coordinate patient care, conduct follow-ups, assist with care planning, and provide patient education. Be compassionate, thorough, and patient-focused.",
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

      if (context.patientId) {
        messages.push({
          role: "system",
          content: `Patient ID: ${context.patientId}`,
        })
      }

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
