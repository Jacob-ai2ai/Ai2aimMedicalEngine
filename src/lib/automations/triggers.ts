import { AutomationTrigger, AutomationTriggerType } from "@/types/automation"
import { createServiceRoleClient } from "@/lib/supabase/client"

export class TriggerSystem {
  private supabase = createServiceRoleClient()
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map()

  /**
   * Check if a trigger condition is met
   */
  async checkTrigger(trigger: AutomationTrigger, context?: Record<string, unknown>): Promise<boolean> {
    switch (trigger.type) {
      case "event":
        return this.checkEventTrigger(trigger, context)
      case "schedule":
        return this.checkScheduleTrigger(trigger)
      case "condition":
        return this.checkConditionTrigger(trigger, context)
      case "webhook":
        return this.checkWebhookTrigger(trigger, context)
      default:
        return false
    }
  }

  private async checkEventTrigger(
    trigger: AutomationTrigger,
    context?: Record<string, unknown>
  ): Promise<boolean> {
    const eventType = trigger.config.eventType as string
    const contextEventType = context?.eventType as string

    if (eventType && contextEventType) {
      return eventType === contextEventType
    }

    return false
  }

  private async checkScheduleTrigger(trigger: AutomationTrigger): Promise<boolean> {
    const schedule = trigger.config.schedule as string
    const timezone = (trigger.config.timezone as string) || "UTC"

    // Simple schedule check - in production, use a proper scheduler
    if (schedule === "daily") {
      const now = new Date()
      const hour = now.getUTCHours()
      const scheduledHour = (trigger.config.hour as number) || 0
      return hour === scheduledHour
    }

    if (schedule === "hourly") {
      // Run every hour
      return true
    }

    return false
  }

  private async checkConditionTrigger(
    trigger: AutomationTrigger,
    context?: Record<string, unknown>
  ): Promise<boolean> {
    const condition = trigger.config.condition as string
    const field = trigger.config.field as string
    const operator = trigger.config.operator as string
    const value = trigger.config.value

    if (!field || !operator || !context) {
      return false
    }

    const fieldValue = context[field]

    switch (operator) {
      case "equals":
        return fieldValue === value
      case "not_equals":
        return fieldValue !== value
      case "greater_than":
        return Number(fieldValue) > Number(value)
      case "less_than":
        return Number(fieldValue) < Number(value)
      case "contains":
        return String(fieldValue).includes(String(value))
      default:
        return false
    }
  }

  private async checkWebhookTrigger(
    trigger: AutomationTrigger,
    context?: Record<string, unknown>
  ): Promise<boolean> {
    // Webhook triggers are typically handled by API endpoints
    return context?.webhook === true
  }

  /**
   * Register a listener for a trigger
   */
  on(triggerId: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(triggerId)) {
      this.listeners.set(triggerId, new Set())
    }
    this.listeners.get(triggerId)!.add(callback)
  }

  /**
   * Emit a trigger event
   */
  emit(triggerId: string, data: unknown): void {
    const callbacks = this.listeners.get(triggerId)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }
}

export const triggerSystem = new TriggerSystem()
