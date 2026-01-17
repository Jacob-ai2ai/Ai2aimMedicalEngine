import { BaseAgent } from "./base-agent"
import { createServiceRoleClient } from "@/lib/supabase/client"
import { UserRole } from "@/types/database"

class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map()
  private supabase = createServiceRoleClient()

  async initialize(): Promise<void> {
    // Load agents from database
    const { data: agents } = await this.supabase.from("ai_agents").select("*").eq("is_active", true)

    if (agents) {
      for (const agentData of agents) {
        // Agents will be instantiated by their specific classes
        // This is a placeholder for the registry structure
        console.log(`Registered agent: ${agentData.name}`)
      }
    }
  }

  register(agent: BaseAgent): void {
    this.agents.set(agent.id, agent)
  }

  get(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId)
  }

  getByRole(role: UserRole): BaseAgent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.role === role)
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values())
  }
}

export const agentRegistry = new AgentRegistry()
