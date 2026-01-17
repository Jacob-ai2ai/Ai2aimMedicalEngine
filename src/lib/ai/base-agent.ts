import {
  BaseAgentInterface,
  AgentMessage,
  AgentContext,
  AgentState,
  AgentConfig,
  AgentCapability,
} from "@/types/ai"
import { UserRole } from "@/types/database"
import { createServiceRoleClient } from "@/lib/supabase/client"

export abstract class BaseAgent implements BaseAgentInterface {
  public readonly id: string
  public readonly name: string
  public readonly role: UserRole
  public readonly agentType: "role_based" | "encoding"
  public readonly description?: string
  public readonly capabilities: AgentCapability[]
  public readonly config: AgentConfig

  protected supabase = createServiceRoleClient()

  constructor(
    id: string,
    name: string,
    role: UserRole,
    agentType: "role_based" | "encoding",
    description?: string,
    capabilities: AgentCapability[] = [],
    config: AgentConfig = {}
  ) {
    this.id = id
    this.name = name
    this.role = role
    this.agentType = agentType
    this.description = description
    this.capabilities = capabilities
    this.config = config
  }

  abstract process(input: string, context: AgentContext): Promise<AgentMessage>

  async getState(sessionId: string): Promise<AgentState | null> {
    const { data } = await this.supabase
      .from("ai_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("agent_id", this.id)
      .single()

    if (!data) {
      return null
    }

    return {
      id: data.id,
      agentId: data.agent_id,
      status: (data.status as AgentState["status"]) || "idle",
      context: (data.context as AgentContext) || {},
      messages: (data.messages as AgentMessage[]) || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async updateState(sessionId: string, state: Partial<AgentState>): Promise<void> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (state.status) {
      updateData.status = state.status
    }
    if (state.context) {
      updateData.context = state.context
    }
    if (state.messages) {
      updateData.messages = state.messages
    }
    if (state.status === "error") {
      updateData.completed_at = new Date().toISOString()
    }

    await this.supabase.from("ai_sessions").update(updateData).eq("id", sessionId)
  }

  async createSession(context: AgentContext): Promise<string> {
    const { data, error } = await this.supabase
      .from("ai_sessions")
      .insert({
        agent_id: this.id,
        user_id: context.userId,
        context,
        messages: [],
        status: "idle",
      })
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(`Failed to create session: ${error?.message}`)
    }

    return data.id
  }

  protected async callLLM(
    messages: AgentMessage[],
    tools?: unknown[]
  ): Promise<AgentMessage> {
    // This is a placeholder - will be implemented with actual LLM integration
    // For now, return a mock response
    return {
      role: "assistant",
      content: "This is a placeholder response. LLM integration will be implemented.",
      timestamp: new Date().toISOString(),
    }
  }

  protected async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    // Tool execution will be handled by MCP integration
    throw new Error(`Tool ${toolName} execution not yet implemented`)
  }
}
