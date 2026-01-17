import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export class AdministrativeAgent extends BaseAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "document_processing",
        description: "Process and organize documents",
        enabled: true,
      },
      {
        name: "scheduling",
        description: "Manage schedules and appointments",
        enabled: true,
      },
      {
        name: "communication_coordination",
        description: "Coordinate communications",
        enabled: true,
      },
      {
        name: "data_entry",
        description: "Assist with data entry tasks",
        enabled: true,
      },
    ]

    super(
      id,
      "Administrative Agent",
      "administrative",
      "role_based",
      "AI agent specialized in administrative tasks, scheduling, and document processing",
      capabilities,
      {
        systemPrompt:
          "You are an administrative AI agent. Your role is to handle administrative tasks, process documents, manage schedules, and coordinate communications. Be efficient, accurate, and maintain confidentiality.",
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
