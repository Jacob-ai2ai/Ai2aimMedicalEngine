import { ToolDefinition, ToolCall, ToolResult } from "@/types/ai"

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: "object"
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface MCPRequest {
  method: string
  params?: Record<string, unknown>
}

export interface MCPResponse {
  result?: unknown
  error?: {
    code: number
    message: string
  }
}

export class MCPClient {
  private baseUrl: string
  private tools: Map<string, MCPTool> = new Map()

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.MCP_SERVER_URL || "http://localhost:3001"
  }

  /**
   * Register a tool with the MCP client
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool)
  }

  /**
   * Get all registered tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tool definitions for LLM
   */
  getToolDefinitions(): ToolDefinition[] {
    return this.getTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }))
  }

  /**
   * Execute a tool call
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(toolCall.name)

    if (!tool) {
      return {
        tool_call_id: toolCall.id,
        result: null,
        error: `Tool not found: ${toolCall.name}`,
      }
    }

    try {
      // Call MCP server
      const response = await fetch(`${this.baseUrl}/tools/${toolCall.name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          arguments: toolCall.arguments,
        }),
      })

      if (!response.ok) {
        throw new Error(`Tool execution failed: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        tool_call_id: toolCall.id,
        result: result.result || result,
      }
    } catch (error) {
      return {
        tool_call_id: toolCall.id,
        result: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Execute multiple tool calls
   */
  async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    return Promise.all(toolCalls.map((call) => this.executeTool(call)))
  }

  /**
   * List available tools from MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tools`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to list tools: ${response.statusText}`)
      }

      const data = await response.json()
      const tools = data.tools || []

      // Register tools locally
      tools.forEach((tool: MCPTool) => {
        this.registerTool(tool)
      })

      return tools
    } catch (error) {
      console.error("Error listing tools from MCP server:", error)
      return []
    }
  }
}

export const mcpClient = new MCPClient()
