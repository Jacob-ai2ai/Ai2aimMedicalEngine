import { BaseAgent } from "./base-agent"
import { agentRegistry } from "./registry"
import { AgentMessage, AgentContext, AgentState } from "@/types/ai"
import { UserRole } from "@/types/database"

export class AgentOrchestrator {
  /**
   * Route a request to the appropriate agent based on role or context
   */
  async routeToAgent(
    role: UserRole,
    input: string,
    context: AgentContext
  ): Promise<AgentMessage> {
    const agents = agentRegistry.getByRole(role)
    if (agents.length === 0) {
      throw new Error(`No agent found for role: ${role}`)
    }

    // For now, use the first agent of the role
    // In the future, this could implement more sophisticated routing
    const agent = agents[0]
    return agent.process(input, context)
  }

  /**
   * Create a new agent session
   */
  async createSession(agentId: string, context: AgentContext): Promise<string> {
    const agent = agentRegistry.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    return agent.createSession(context)
  }

  /**
   * Get session state
   */
  async getSessionState(sessionId: string): Promise<AgentState | null> {
    // Try to find the agent by checking all agents
    const agents = agentRegistry.getAll()
    for (const agent of agents) {
      const state = await agent.getState(sessionId)
      if (state) {
        return state
      }
    }
    return null
  }

  /**
   * Process a message in an existing session
   */
  async processMessage(
    sessionId: string,
    message: string,
    context?: Partial<AgentContext>
  ): Promise<AgentMessage> {
    const state = await this.getSessionState(sessionId)
    if (!state) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    const agent = agentRegistry.get(state.agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${state.agentId}`)
    }

    const fullContext: AgentContext = {
      ...state.context,
      ...context,
    }

    return agent.process(message, fullContext)
  }

  /**
   * Coordinate multiple agents for complex tasks
   */
  async coordinateAgents(
    agentIds: string[],
    task: string,
    context: AgentContext
  ): Promise<AgentMessage[]> {
    const results: AgentMessage[] = []

    for (const agentId of agentIds) {
      const agent = agentRegistry.get(agentId)
      if (agent) {
        const result = await agent.process(task, context)
        results.push(result)
      }
    }

    return results
  }
}

export const agentOrchestrator = new AgentOrchestrator()
