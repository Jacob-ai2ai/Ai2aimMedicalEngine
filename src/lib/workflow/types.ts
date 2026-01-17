export interface WorkflowStep {
  id: string
  type: "agent" | "mcp_tool" | "condition" | "notification"
  target: string
  params: Record<string, any>
  next?: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  version: number
  description: string
  trigger: {
    type: "event" | "schedule" | "manual"
    event?: string
    cron?: string
  }
  steps: WorkflowStep[]
  isActive: boolean
}

export interface WorkflowInstance {
  id: string
  definitionId: string
  status: "idle" | "running" | "completed" | "failed" | "rolled_back"
  currentStep?: string
  context: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface WorkflowEvent {
  id: string
  workflowId: string
  type: "info" | "decision" | "alert" | "error"
  description: string
  narrative: string // Human-readable narrative for the Cognitive Feed
  timestamp: string
}
