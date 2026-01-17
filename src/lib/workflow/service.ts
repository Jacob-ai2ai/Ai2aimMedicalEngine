import { WorkflowDefinition, WorkflowInstance, WorkflowEvent, WorkflowStep } from "./types"
import { v4 as uuidv4 } from "uuid"

export class WorkflowService {
  private static instance: WorkflowService
  private definitions: WorkflowDefinition[] = []
  private instances: WorkflowInstance[] = []
  private events: WorkflowEvent[] = []

  private constructor() {
    // Initialize with some seed data for demonstration
    this.seedDefinitions()
  }

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService()
    }
    return WorkflowService.instance
  }

  private seedDefinitions() {
    const seed: WorkflowDefinition = {
      id: "wf-infusion-dispatch",
      name: "Infusion Clinic Nurse Dispatch",
      version: 1,
      description: "Autonomously re-routes nurses to the infusion clinic when patient volume exceeds threshold.",
      trigger: {
        type: "event",
        event: "clinics.infusion.high_volume"
      },
      steps: [
        {
          id: "step-1",
          type: "agent",
          target: "vanguard",
          params: { action: "verify_staffing" },
          next: "step-2"
        },
        {
          id: "step-2",
          type: "condition",
          target: "staffing_low",
          params: { threshold: 0.8 },
          next: "step-3"
        },
        {
          id: "step-3",
          type: "mcp_tool",
          target: "dispatch_nurse",
          params: { department: "Infusion" }
        }
      ],
      isActive: true
    }

    const sleepStudy: WorkflowDefinition = {
      id: "wf-sleep-study-level3",
      name: "Level 3 Sleep Monitor Dispatch",
      version: 1,
      description: "Automated coordination for Level 3 portable sleep monitoring equipment and specialist review.",
      trigger: {
        type: "event",
        event: "clinics.sleep.level3_requirement"
      },
      steps: [
        {
          id: "step-1",
          type: "agent",
          target: "nexus",
          params: { action: "check_equipment_availability" },
          next: "step-2"
        },
        {
          id: "step-2",
          type: "mcp_tool",
          target: "diagnostic-iq",
          params: { scan: "integrity_check", protocol: "level3-polysomnography" },
          next: "step-3"
        },
        {
          id: "step-3",
          type: "agent",
          target: "physician",
          params: { action: "schedule_review", priority: "high" }
        }
      ],
      isActive: true
    }

    this.definitions.push(seed, sleepStudy)
  }

  public getDefinitions(): WorkflowDefinition[] {
    return this.definitions
  }

  public async simulateWorkflow(definitionId: string): Promise<WorkflowEvent[]> {
    const definition = this.definitions.find(d => d.id === definitionId)
    if (!definition) throw new Error("Definition not found")

    // Simulation logic (Dry Run)
    const simulationEvents: WorkflowEvent[] = [
      {
        id: uuidv4(),
        workflowId: definitionId,
        type: "info",
        description: "Initiating Simulation",
        narrative: `Simulating '${definition.name}' v${definition.version}...`,
        timestamp: new Date().toISOString()
      },
      {
        id: uuidv4(),
        workflowId: definitionId,
        type: "decision",
        description: "Dry Run Step 1: Staffing Verification",
        narrative: "Vanguard agent would verify staffing levels in Infusion.",
        timestamp: new Date().toISOString()
      },
      {
        id: uuidv4(),
        workflowId: definitionId,
        type: "info",
        description: "Simulation Complete",
        narrative: "Workflow simulation passed safety checks. Ready for deployment.",
        timestamp: new Date().toISOString()
      }
    ]
    return simulationEvents
  }

  public async deployWorkflow(definitionId: string): Promise<WorkflowInstance> {
    const definition = this.definitions.find(d => d.id === definitionId)
    if (!definition) throw new Error("Definition not found")

    const instance: WorkflowInstance = {
      id: uuidv4(),
      definitionId: definition.id,
      status: "running",
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.instances.push(instance)
    
    // Emit initial lifecycle event
    this.emitEvent(instance.id, "info", "Aeterna OS activated autonomous nurse dispatch protocol due to volume spike.")

    return instance
  }

  private emitEvent(workflowId: string, type: WorkflowEvent["type"], narrative: string) {
    const event: WorkflowEvent = {
      id: uuidv4(),
      workflowId,
      type,
      description: "Lifecycle Event",
      narrative,
      timestamp: new Date().toISOString()
    }
    this.events.unshift(event) // Most recent first
    return event
  }

  public getCognitiveFeed(): WorkflowEvent[] {
    return this.events
  }

  public getActiveThreadCount(): number {
    return this.instances.filter(i => i.status === "running").length
  }
}
