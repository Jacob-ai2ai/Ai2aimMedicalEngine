/**
 * Visual Workflow Execution Engine
 * Executes visual workflows compiled from the builder
 */

import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge } from '@/types/workflow-visual'
import { createServerSupabase } from '@/lib/supabase/server'
import { cpapComplianceService } from '@/lib/medical/cpap-compliance-service'
import { dmeService } from '@/lib/medical/dme-service'
import { sleepStudyService } from '@/lib/medical/sleep-study-service'
import { pftService } from '@/lib/medical/pft-service'
import { agentOrchestrator } from '@/lib/ai/orchestrator'
import { UserRole } from '@/types/database'

export interface WorkflowExecutionContext {
  [key: string]: any
  workflowId: string
  userId?: string
  eventType?: string
}

export interface WorkflowExecutionResult {
  success: boolean
  duration: number
  results: Record<string, any>
  error?: string
  skipped?: boolean
}

export class VisualWorkflowExecutionEngine {
  /**
   * Execute a visual workflow
   */
  async execute(
    workflow: VisualWorkflow,
    context: WorkflowExecutionContext
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now()
    const results: Record<string, any> = {}
    
    try {
      // Find trigger node
      const triggerNode = workflow.nodes.find(n => n.type === 'trigger')
      if (!triggerNode) {
        throw new Error('Workflow must have a trigger node')
      }
      
      // Check trigger
      const triggerResult = await this.executeNode(triggerNode, context)
      if (!triggerResult.success) {
        return {
          success: false,
          duration: Date.now() - startTime,
          results: {},
          skipped: true
        }
      }
      
      results[triggerNode.id] = triggerResult.output
      
      // Build execution order
      const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.edges, triggerNode.id)
      
      // Execute nodes in order
      let currentContext = { ...context, ...triggerResult.output }
      
      for (let i = 1; i < executionOrder.length; i++) {
        const nodeId = executionOrder[i]
        const node = workflow.nodes.find(n => n.id === nodeId)
        if (!node) continue
        
        // Check if condition node should skip
        if (node.data.type === 'condition') {
          const conditionResult = this.evaluateCondition(node, currentContext)
          if (!conditionResult) {
            // Skip remaining nodes in this branch
            break
          }
          currentContext = { ...currentContext, condition: true }
        }
        
        // Execute node
        const nodeResult = await this.executeNode(node, currentContext)
        results[node.id] = nodeResult.output
        
        if (!nodeResult.success) {
          return {
            success: false,
            duration: Date.now() - startTime,
            results,
            error: nodeResult.error
          }
        }
        
        // Update context for next node
        currentContext = { ...currentContext, ...nodeResult.output }
      }
      
      return {
        success: true,
        duration: Date.now() - startTime,
        results
      }
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        results,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async executeNode(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    
    try {
      switch (node.data.type) {
        case 'trigger':
          return await this.executeTrigger(node, context)
        
        case 'database':
          return await this.executeDatabase(node, context)
        
        case 'api-call':
          return await this.executeAPICall(node, context)
        
        case 'notification':
          return await this.executeNotification(node, context)
        
        case 'delay':
          await new Promise(resolve => setTimeout(resolve, config.delayMs || 1000))
          return { success: true, output: { delayed: config.delayMs } }
        
        case 'sleep-clinic-cpap':
          return await this.executeCPAPNode(node, context)
        
        case 'sleep-clinic-dme':
          return await this.executeDMENode(node, context)
        
        case 'sleep-clinic-sleep-study':
          return await this.executeSleepStudyNode(node, context)
        
        case 'sleep-clinic-pft':
          return await this.executePFTNode(node, context)
        
        case 'ai-agent':
          return await this.executeAIAgent(node, context)
        
        default:
          return { success: true, output: { processed: true } }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async executeTrigger(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any }> {
    const config = node.data.config || {}
    
    if (config.triggerType === 'event') {
      const matches = context.eventType === config.eventType
      return { success: matches, output: { triggered: matches } }
    } else if (config.triggerType === 'schedule') {
      // Schedule triggers are handled by cron jobs
      return { success: true, output: { triggered: true } }
    }
    
    return { success: true, output: { triggered: true } }
  }

  private async executeDatabase(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const table = config.table || 'patients'
    const operation = config.operation || 'select'
    
    try {
      const supabase = await createServerSupabase()
      
      if (operation === 'select') {
        const query = supabase.from(table).select('*')
        if (config.filter) {
          Object.entries(config.filter).forEach(([key, value]) => {
            query.eq(key, value)
          })
        }
        const { data, error } = await query
        if (error) throw error
        return { success: true, output: { records: data } }
      } else if (operation === 'update') {
        const { data, error } = await supabase
          .from(table)
          .update(config.updateData || {})
          .eq('id', context.id || config.id)
          .select()
        if (error) throw error
        return { success: true, output: { updated: data } }
      } else if (operation === 'insert') {
        const { data, error } = await supabase
          .from(table)
          .insert(config.insertData || context.data || {})
          .select()
        if (error) throw error
        return { success: true, output: { inserted: data } }
      }
      
      return { success: false, error: 'Unknown database operation' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }
    }
  }

  private async executeAPICall(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const url = config.url || ''
    const method = config.method || 'POST'
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers || {})
        },
        body: config.body ? JSON.stringify(config.body) : JSON.stringify(context)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }
      
      return { success: true, output: data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API call error'
      }
    }
  }

  private async executeNotification(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const recipient = config.recipient || ''
    const message = config.message || 'Notification'
    
    try {
      const supabase = await createServerSupabase()
      
      const { data, error } = await supabase
        .from('communications')
        .insert({
          communication_type: 'notification',
          direction: 'outbound',
          subject: config.subject || 'Workflow Notification',
          content: message,
          patient_id: context.patientId,
          metadata: { workflowId: context.workflowId }
        })
        .select()
        .single()
      
      if (error) throw error
      
      return { success: true, output: { notificationId: data.id, sent: true } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Notification error'
      }
    }
  }

  private async executeCPAPNode(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const action = config.action || 'check-compliance'
    
    try {
      if (action === 'check-compliance') {
        const days = config.days || 21
        const patients = await cpapComplianceService.getNonCompliantPatients(days)
        return { success: true, output: { nonCompliant: patients, count: patients.length } }
      } else if (action === 'sync-data') {
        const result = await cpapComplianceService.importResMedData(
          context.patientId,
          context.data
        )
        return { success: true, output: result }
      } else if (action === 'calculate') {
        const result = await cpapComplianceService.calculateMonthlyCompliance(context.patientId)
        return { success: true, output: result }
      }
      
      return { success: false, error: 'Unknown CPAP action' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CPAP service error'
      }
    }
  }

  private async executeDMENode(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const action = config.action || 'check-inventory'
    
    try {
      if (action === 'check-inventory') {
        const equipment = await dmeService.getAvailableEquipment(config.equipmentType)
        return { success: true, output: { available: equipment } }
      } else if (action === 'assign') {
        const result = await dmeService.assignEquipmentToPatient(
          context.inventoryId,
          context.patientId
        )
        return { success: true, output: { assigned: result } }
      } else if (action === 'get-inventory') {
        const inventory = await dmeService.getInventoryForEquipment(context.equipmentId)
        return { success: true, output: { inventory } }
      }
      
      return { success: false, error: 'Unknown DME action' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'DME service error'
      }
    }
  }

  private async executeSleepStudyNode(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const action = config.action || 'dispatch'
    
    try {
      if (action === 'dispatch') {
        const monitors = await sleepStudyService.getAvailableMonitors()
        if (monitors.length === 0) {
          return { success: false, error: 'No available monitors' }
        }
        const result = await sleepStudyService.dispatchMonitor(
          context.studyId,
          monitors[0].serial_number
        )
        return { success: true, output: { dispatched: result, monitor: monitors[0] } }
      } else if (action === 'return') {
        const result = await sleepStudyService.recordReturn(context.studyId)
        return { success: true, output: { returned: result } }
      } else if (action === 'get-available') {
        const monitors = await sleepStudyService.getAvailableMonitors()
        return { success: true, output: { monitors } }
      }
      
      return { success: false, error: 'Unknown sleep study action' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sleep study service error'
      }
    }
  }

  private async executePFTNode(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const action = config.action || 'schedule'
    
    try {
      if (action === 'schedule') {
        const result = await pftService.createPFTTest({
          patient_id: context.patientId,
          test_type: config.testType || 'spirometry',
          scheduled_date: config.scheduledDate || new Date().toISOString(),
          location_id: config.locationId
        })
        return { success: true, output: { test: result } }
      } else if (action === 'record-results') {
        const result = await pftService.recordPFTResults(context.testId, context.results)
        return { success: true, output: { results: result } }
      } else if (action === 'get-tests') {
        const tests = await pftService.getPatientPFTTests(context.patientId)
        return { success: true, output: { tests } }
      }
      
      return { success: false, error: 'Unknown PFT action' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PFT service error'
      }
    }
  }

  private async executeAIAgent(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const config = node.data.config || {}
    const agentRole = (config.agentRole || 'physician') as UserRole
    const message = config.message || 'Process request'
    
    try {
      const response = await agentOrchestrator.routeToAgent(agentRole, message, context)
      return { success: true, output: { response: response.content } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI agent error'
      }
    }
  }

  private evaluateCondition(
    node: VisualWorkflowNode,
    context: WorkflowExecutionContext
  ): boolean {
    const config = node.data.config || {}
    const field = config.field || ''
    const operator = config.operator || 'equals'
    const value = config.value
    
    const fieldValue = context[field]
    
    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'not_equals':
        return fieldValue !== value
      case 'greater_than':
        return Number(fieldValue) > Number(value)
      case 'less_than':
        return Number(fieldValue) < Number(value)
      case 'contains':
        return String(fieldValue).includes(String(value))
      default:
        return true
    }
  }

  private getExecutionOrder(
    nodes: VisualWorkflowNode[],
    edges: VisualWorkflowEdge[],
    startNodeId: string
  ): string[] {
    const order: string[] = [startNodeId]
    const visited = new Set<string>([startNodeId])
    
    let currentId = startNodeId
    while (true) {
      const outgoingEdge = edges.find(e => e.source === currentId)
      if (!outgoingEdge) break
      
      const nextNodeId = outgoingEdge.target
      if (visited.has(nextNodeId)) break
      
      order.push(nextNodeId)
      visited.add(nextNodeId)
      currentId = nextNodeId
    }
    
    return order
  }
}

// Fix: Remove await from class property
export class VisualWorkflowExecutionEngine {
  private supabase = createServerSupabase()

  // ... rest of the class remains the same
}
