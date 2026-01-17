import { UserRole } from "./database"

export type AgentType = "role_based" | "encoding"

export interface AgentMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
  timestamp?: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  tool_call_id: string
  result: unknown
  error?: string
}

export interface AgentContext {
  userId?: string
  sessionId?: string
  patientId?: string
  prescriptionId?: string
  communicationType?: string
  metadata?: Record<string, unknown>
}

export interface AgentConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  tools?: ToolDefinition[]
  systemPrompt?: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface AgentCapability {
  name: string
  description: string
  enabled: boolean
}

export interface AgentState {
  id: string
  agentId: string
  status: "idle" | "thinking" | "processing" | "error"
  context: AgentContext
  messages: AgentMessage[]
  createdAt: string
  updatedAt: string
}

export interface BaseAgentInterface {
  id: string
  name: string
  role: UserRole
  agentType: AgentType
  description?: string
  capabilities: AgentCapability[]
  config: AgentConfig

  process(input: string, context: AgentContext): Promise<AgentMessage>
  getState(sessionId: string): Promise<AgentState | null>
  updateState(sessionId: string, state: Partial<AgentState>): Promise<void>
}
