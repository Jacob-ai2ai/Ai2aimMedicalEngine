import { LetterEncodingAgent } from "./letter-encoding-agent"
import { ReferralEncodingAgent } from "./referral-encoding-agent"
import { CommunicationEncodingAgent } from "./communication-encoding-agent"
import { DocumentEncodingAgent } from "./document-encoding-agent"
import { agentRegistry } from "../registry"
import { createServiceRoleClient } from "@/lib/supabase/client"

export async function initializeEncodingAgents(): Promise<void> {
  const supabase = createServiceRoleClient()
  const { data: agents } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("is_active", true)
    .eq("agent_type", "encoding")

  if (!agents) {
    return
  }

  for (const agentData of agents) {
    let agent

    switch (agentData.name) {
      case "Letter Encoding Agent":
        agent = new LetterEncodingAgent(agentData.id)
        break
      case "Referral Encoding Agent":
        agent = new ReferralEncodingAgent(agentData.id)
        break
      case "Communication Encoding Agent":
        agent = new CommunicationEncodingAgent(agentData.id)
        break
      case "Document Encoding Agent":
        agent = new DocumentEncodingAgent(agentData.id)
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
  LetterEncodingAgent,
  ReferralEncodingAgent,
  CommunicationEncodingAgent,
  DocumentEncodingAgent,
}
