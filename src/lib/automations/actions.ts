import { AutomationAction, AutomationActionType } from "@/types/automation"
import { createServiceRoleClient } from "@/lib/supabase/client"
import { agentOrchestrator } from "@/lib/ai/orchestrator"
import { UserRole } from "@/types/database"

export class ActionSystem {
  private supabase = createServiceRoleClient()

  /**
   * Execute an automation action
   */
  async executeAction(
    action: AutomationAction,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    switch (action.type) {
      case "notification":
        return this.executeNotificationAction(action, context)
      case "task":
        return this.executeTaskAction(action, context)
      case "api_call":
        return this.executeApiCallAction(action, context)
      case "ai_agent":
        return this.executeAIAgentAction(action, context)
      case "workflow":
        return this.executeWorkflowAction(action, context)
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private async executeNotificationAction(
    action: AutomationAction,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const recipient = action.config.recipient as string
    const message = action.config.message as string
    const subject = (action.config.subject as string) || "Automation Notification"

    // Create a communication record
    const { data, error } = await this.supabase
      .from("communications")
      .insert({
        communication_type: "notification",
        direction: "outbound",
        subject,
        content: message,
        patient_id: context?.patientId as string | undefined,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`)
    }

    return { notificationId: data.id, success: true }
  }

  private async executeTaskAction(
    action: AutomationAction,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const taskType = action.config.taskType as string
    const taskData = action.config.taskData as Record<string, unknown>

    // Execute task based on type
    switch (taskType) {
      case "update_prescription_status":
        const { data, error } = await this.supabase
          .from("prescriptions")
          .update({ status: taskData.status })
          .eq("id", taskData.prescriptionId)
          .select()
          .single()

        if (error) {
          throw new Error(`Failed to update prescription: ${error.message}`)
        }

        return { prescriptionId: data.id, success: true }

      default:
        throw new Error(`Unknown task type: ${taskType}`)
    }
  }

  private async executeApiCallAction(
    action: AutomationAction,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const url = action.config.url as string
    const method = (action.config.method as string) || "POST"
    const headers = (action.config.headers as Record<string, string>) || {}
    const body = action.config.body as Record<string, unknown>

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      const result = await response.json()

      return { success: response.ok, result }
    } catch (error) {
      throw new Error(`API call failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private async executeAIAgentAction(
    action: AutomationAction,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const agentRole = action.config.agentRole as UserRole
    const message = action.config.message as string
    const agentContext = (action.config.context as Record<string, unknown>) || {}

    try {
      const response = await agentOrchestrator.routeToAgent(
        agentRole,
        message,
        agentContext as any
      )

      return { success: true, response: response.content }
    } catch (error) {
      throw new Error(
        `AI agent action failed: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  private async executeWorkflowAction(
    action: AutomationAction,
    context?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const workflowId = action.config.workflowId as string
    const steps = action.config.steps as AutomationAction[]

    const results: Record<string, unknown>[] = []

    for (const step of steps) {
      try {
        const result = await this.executeAction(step, context)
        results.push(result)
      } catch (error) {
        throw new Error(
          `Workflow step failed: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }
    }

    return { workflowId, steps: results, success: true }
  }
}

export const actionSystem = new ActionSystem()
