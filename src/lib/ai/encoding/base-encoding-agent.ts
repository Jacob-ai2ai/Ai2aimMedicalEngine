import { BaseAgent } from "../base-agent"
import { AgentMessage, AgentContext, AgentCapability } from "@/types/ai"
import { UserRole } from "@/types/database"

export abstract class BaseEncodingAgent extends BaseAgent {
  constructor(
    id: string,
    name: string,
    description: string,
    capabilities: AgentCapability[]
  ) {
    super(
      id,
      name,
      "administrative",
      "encoding",
      description,
      capabilities,
      {
        systemPrompt:
          "You are an encoding AI agent. Your role is to extract structured data from documents, categorize content, identify key information, and encode it into the system. Be precise and maintain data integrity.",
        temperature: 0.3, // Lower temperature for more consistent extraction
        maxTokens: 4000,
      }
    )
  }

  abstract extractStructuredData(content: string, context: AgentContext): Promise<Record<string, unknown>>

  async process(input: string, context: AgentContext): Promise<AgentMessage> {
    await this.updateState(context.sessionId || "", {
      status: "processing",
    })

    try {
      // Extract structured data
      const extractedData = await this.extractStructuredData(input, context)

      // Format response
      const response: AgentMessage = {
        role: "assistant",
        content: JSON.stringify(extractedData, null, 2),
        timestamp: new Date().toISOString(),
      }

      await this.updateState(context.sessionId || "", {
        status: "idle",
        messages: [
          {
            role: "user",
            content: input,
            timestamp: new Date().toISOString(),
          },
          response,
        ],
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
