import { Automation, AutomationRun } from "@/types/automation"
import { triggerSystem } from "./triggers"
import { actionSystem } from "./actions"
import { createServiceRoleClient } from "@/lib/supabase/client"

export class AutomationEngine {
  private supabase = createServiceRoleClient()

  /**
   * Execute an automation
   */
  async executeAutomation(
    automation: Automation,
    context?: Record<string, unknown>
  ): Promise<AutomationRun> {
    const startTime = Date.now()

    // Create run record
    const { data: run, error: runError } = await this.supabase
      .from("automation_runs")
      .insert({
        automation_id: automation.id,
        status: "running",
        input_data: context || {},
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (runError || !run) {
      throw new Error(`Failed to create automation run: ${runError?.message}`)
    }

    try {
      // Check trigger
      const triggerMet = await triggerSystem.checkTrigger(automation.trigger, context)

      if (!triggerMet) {
        // Update run as completed (trigger not met)
        await this.supabase
          .from("automation_runs")
          .update({
            status: "success",
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - startTime,
            output_data: { triggerNotMet: true },
          })
          .eq("id", run.id)

        return {
          ...run,
          status: "success",
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          outputData: { triggerNotMet: true },
        }
      }

      // Execute action
      const result = await actionSystem.executeAction(automation.action, context)

      // Update run as successful
      await this.supabase
        .from("automation_runs")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          output_data: result,
        })
        .eq("id", run.id)

      return {
        ...run,
        status: "success",
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        outputData: result,
      }
    } catch (error) {
      // Update run as failed
      await this.supabase
        .from("automation_runs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", run.id)

      return {
        ...run,
        status: "failed",
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Get all active automations
   */
  async getActiveAutomations(): Promise<Automation[]> {
    const { data, error } = await this.supabase
      .from("automations")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch automations: ${error.message}`)
    }

    return (
      data?.map((auto) => ({
        id: auto.id,
        name: auto.name,
        description: auto.description,
        trigger: auto.trigger_config as Automation["trigger"],
        action: auto.action_config as Automation["action"],
        isActive: auto.is_active,
        priority: auto.priority,
        createdAt: auto.created_at,
        updatedAt: auto.updated_at,
      })) || []
    )
  }

  /**
   * Process event and check all automations
   */
  async processEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    const automations = await this.getActiveAutomations()

    for (const automation of automations) {
      // Check if automation should be triggered by this event
      if (automation.trigger.type === "event") {
        const triggerEventType = automation.trigger.config.eventType as string
        if (triggerEventType === eventType) {
          await this.executeAutomation(automation, {
            eventType,
            ...eventData,
          })
        }
      }
    }
  }
}

export const automationEngine = new AutomationEngine()
