import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export class PhysicianAgent extends BaseAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "prescription_authorization",
        description: "Authorize prescriptions based on patient history",
        enabled: true,
      },
      {
        name: "patient_review",
        description: "Review patient cases and medical history",
        enabled: true,
      },
      {
        name: "clinical_decision_support",
        description: "Provide clinical decision support",
        enabled: true,
      },
      {
        name: "diagnosis_assistance",
        description: "Assist with diagnosis based on symptoms",
        enabled: true,
      },
    ]

    super(
      id,
      "Physician Agent",
      "physician",
      "role_based",
      "AI agent specialized in prescription authorization, patient review, and medical decision support",
      capabilities,
      {
        systemPrompt:
          "You are a licensed physician AI agent. Your role is to review patient cases, authorize prescriptions, provide medical decision support, and ensure appropriate care. Always consider patient history, allergies, and clinical guidelines.",
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
