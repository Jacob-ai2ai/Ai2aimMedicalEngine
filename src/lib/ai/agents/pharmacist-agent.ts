import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export class PharmacistAgent extends BaseAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "prescription_verification",
        description: "Verify prescription details and validity",
        enabled: true,
      },
      {
        name: "drug_interaction_check",
        description: "Check for potential drug interactions",
        enabled: true,
      },
      {
        name: "medication_counseling",
        description: "Provide medication counseling to patients",
        enabled: true,
      },
      {
        name: "dosage_verification",
        description: "Verify appropriate medication dosages",
        enabled: true,
      },
    ]

    super(
      id,
      "Pharmacist Agent",
      "pharmacist",
      "role_based",
      "AI agent specialized in prescription verification, drug interactions, and medication counseling",
      capabilities,
      {
        systemPrompt:
          "You are a licensed pharmacist AI agent. Your role is to verify prescriptions, check for drug interactions, provide medication counseling, and ensure patient safety. Always prioritize patient safety and compliance with pharmaceutical regulations.",
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
      // Build messages with system prompt
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

      // Add context information if available
      if (context.patientId) {
        messages.push({
          role: "system",
          content: `Patient ID: ${context.patientId}`,
        })
      }

      if (context.prescriptionId) {
        messages.push({
          role: "system",
          content: `Prescription ID: ${context.prescriptionId}`,
        })
      }

      // Call LLM (placeholder for now)
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
