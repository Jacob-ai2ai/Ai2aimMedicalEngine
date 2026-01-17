export type AutomationTriggerType = "event" | "schedule" | "condition" | "webhook"

export type AutomationActionType =
  | "notification"
  | "task"
  | "api_call"
  | "ai_agent"
  | "workflow"

export interface AutomationTrigger {
  type: AutomationTriggerType
  config: Record<string, unknown>
}

export interface AutomationAction {
  type: AutomationActionType
  config: Record<string, unknown>
}

export interface Automation {
  id: string
  name: string
  description?: string
  trigger: AutomationTrigger
  action: AutomationAction
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface AutomationRun {
  id: string
  automationId: string
  status: "success" | "failed" | "running"
  inputData?: Record<string, unknown>
  outputData?: Record<string, unknown>
  errorMessage?: string
  startedAt: string
  completedAt?: string
  durationMs?: number
}
