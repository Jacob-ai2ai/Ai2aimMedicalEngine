import { MCPClient, MCPTool } from "./mcp-client"
import { createServiceRoleClient } from "@/lib/supabase/client"

/**
 * Medical-specific MCP tools
 */
export class MedicalMCPTools {
  private supabase = createServiceRoleClient()

  /**
   * Get patient information
   */
  async getPatient(patientId: string): Promise<unknown> {
    const { data } = await this.supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single()

    return data
  }

  /**
   * Get prescription information
   */
  async getPrescription(prescriptionId: string): Promise<unknown> {
    const { data } = await this.supabase
      .from("prescriptions")
      .select(`
        *,
        patients:patient_id (*),
        medications:medication_id (*)
      `)
      .eq("id", prescriptionId)
      .single()

    return data
  }

  /**
   * Search for medications
   */
  async searchMedications(query: string): Promise<unknown> {
    const { data } = await this.supabase
      .from("medications")
      .select("*")
      .or(`name.ilike.%${query}%,generic_name.ilike.%${query}%`)
      .limit(10)

    return data
  }

  /**
   * Create a communication
   */
  async createCommunication(
    type: string,
    direction: string,
    content: string,
    patientId?: string
  ): Promise<unknown> {
    const { data } = await this.supabase
      .from("communications")
      .insert({
        communication_type: type,
        direction,
        content,
        patient_id: patientId,
      })
      .select()
      .single()

    return data
  }

  /**
   * Update prescription status
   */
  async updatePrescriptionStatus(
    prescriptionId: string,
    status: string
  ): Promise<unknown> {
    const { data } = await this.supabase
      .from("prescriptions")
      .update({ status })
      .eq("id", prescriptionId)
      .select()
      .single()

    return data
  }
}

/**
 * Register medical tools with MCP client
 */
export function registerMedicalTools(mcpClient: MCPClient): void {
  const medicalTools = new MedicalMCPTools()

  // Register get_patient tool
  mcpClient.registerTool({
    name: "get_patient",
    description: "Get patient information by patient ID",
    inputSchema: {
      type: "object",
      properties: {
        patientId: {
          type: "string",
          description: "The patient ID",
        },
      },
      required: ["patientId"],
    },
  })

  // Register get_prescription tool
  mcpClient.registerTool({
    name: "get_prescription",
    description: "Get prescription information by prescription ID",
    inputSchema: {
      type: "object",
      properties: {
        prescriptionId: {
          type: "string",
          description: "The prescription ID",
        },
      },
      required: ["prescriptionId"],
    },
  })

  // Register search_medications tool
  mcpClient.registerTool({
    name: "search_medications",
    description: "Search for medications by name",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for medication name",
        },
      },
      required: ["query"],
    },
  })

  // Register create_communication tool
  mcpClient.registerTool({
    name: "create_communication",
    description: "Create a new communication (letter, message, referral)",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["letter", "referral", "message", "notification"],
          description: "Type of communication",
        },
        direction: {
          type: "string",
          enum: ["inbound", "outbound"],
          description: "Direction of communication",
        },
        content: {
          type: "string",
          description: "Content of the communication",
        },
        patientId: {
          type: "string",
          description: "Optional patient ID",
        },
      },
      required: ["type", "direction", "content"],
    },
  })

  // Register update_prescription_status tool
  mcpClient.registerTool({
    name: "update_prescription_status",
    description: "Update the status of a prescription",
    inputSchema: {
      type: "object",
      properties: {
        prescriptionId: {
          type: "string",
          description: "The prescription ID",
        },
        status: {
          type: "string",
          enum: ["pending", "approved", "rejected", "filled", "dispensed", "cancelled"],
          description: "New status for the prescription",
        },
      },
      required: ["prescriptionId", "status"],
    },
  })
}
