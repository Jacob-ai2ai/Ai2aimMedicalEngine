import { PharmacistAgent } from "./pharmacist-agent"
import { PhysicianAgent } from "./physician-agent"
import { AdministrativeAgent } from "./administrative-agent"
import { NurseAgent } from "./nurse-agent"
import { BillingAgent } from "./billing-agent"
import { ComplianceAgent } from "./compliance-agent"
import { agentRegistry } from "../registry"
import { createServiceRoleClient } from "@/lib/supabase/client"

export async function initializeAgents(): Promise<void> {
  const supabase = createServiceRoleClient()
  const { data: agents } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("is_active", true)

  if (!agents) {
    return
  }

  for (const agentData of agents) {
    let agent

    switch (agentData.role) {
      case "pharmacist":
        agent = new PharmacistAgent(agentData.id)
        break
      case "physician":
        agent = new PhysicianAgent(agentData.id)
        break
      case "administrative":
        agent = new AdministrativeAgent(agentData.id)
        break
      case "nurse":
        agent = new NurseAgent(agentData.id)
        break
      case "billing":
        agent = new BillingAgent(agentData.id)
        break
      case "compliance":
        agent = new ComplianceAgent(agentData.id)
        break
      default:
        continue
    }

    if (agent) {
      agentRegistry.register(agent)
    }
  }
}

export {
  PharmacistAgent,
  PhysicianAgent,
  AdministrativeAgent,
  NurseAgent,
  BillingAgent,
  ComplianceAgent,
}
