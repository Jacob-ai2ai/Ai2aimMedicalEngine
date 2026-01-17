/**
 * Outcome Simulator Service
 * Simulates workflow execution to preview expected outcomes
 */

import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge, WorkflowExecutionPreview } from '@/types/workflow-visual'

export class WorkflowOutcomeSimulator {
  /**
   * Simulate workflow execution with sample data
   */
  static async simulate(
    workflow: VisualWorkflow,
    sampleContext: Record<string, any> = {}
  ): Promise<WorkflowExecutionPreview[]> {
    const previews: WorkflowExecutionPreview[] = []
    
    // Find trigger node
    const triggerNode = workflow.nodes.find(n => n.type === 'trigger')
    if (!triggerNode) {
      throw new Error('Workflow must have a trigger node')
    }
    
    // Simulate trigger
    previews.push({
      step: 0,
      nodeId: triggerNode.id,
      nodeLabel: triggerNode.data.label,
      status: 'success',
      input: sampleContext,
      output: { triggered: true }
    })
    
    // Build execution order
    const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.edges, triggerNode.id)
    let stepNumber = 1
    let currentData = { ...sampleContext, triggered: true }
    
    for (const nodeId of executionOrder.slice(1)) {
      const node = workflow.nodes.find(n => n.id === nodeId)
      if (!node) continue
      
      // Simulate node execution
      const simulation = await this.simulateNode(node, currentData, workflow.edges)
      
      previews.push({
        step: stepNumber++,
        nodeId: node.id,
        nodeLabel: node.data.label,
        status: simulation.status,
        input: currentData,
        output: simulation.output,
        error: simulation.error,
        duration: simulation.duration
      })
      
      // Update current data for next node
      if (simulation.status === 'success' && simulation.output) {
        currentData = { ...currentData, ...simulation.output }
      }
      
      // Stop if error
      if (simulation.status === 'error') {
        break
      }
    }
    
    return previews
  }

  private static async simulateNode(
    node: VisualWorkflowNode,
    inputData: Record<string, any>,
    edges: VisualWorkflowEdge[]
  ): Promise<{
    status: 'success' | 'error' | 'skipped'
    output?: Record<string, any>
    error?: string
    duration?: number
  }> {
    // Simulate execution delay
    const duration = Math.random() * 500 + 100
    
    try {
      switch (node.data.type) {
        case 'condition':
          const conditionResult = this.simulateCondition(node, inputData)
          return {
            status: conditionResult ? 'success' : 'skipped',
            output: { condition: conditionResult },
            duration
          }
        
        case 'database':
          return {
            status: 'success',
            output: { 
              record: { id: 'sample-id', ...inputData },
              affected: 1 
            },
            duration
          }
        
        case 'api-call':
          return {
            status: 'success',
            output: { 
              response: { status: 200, data: 'API response' },
              success: true 
            },
            duration: duration * 2 // API calls take longer
          }
        
        case 'notification':
          return {
            status: 'success',
            output: { 
              notificationId: 'notif-123',
              sent: true,
              recipient: node.data.config.recipient || 'user@example.com'
            },
            duration
          }
        
        case 'sleep-clinic-cpap':
          if (node.data.config.action === 'check-compliance') {
            return {
              status: 'success',
              output: {
                nonCompliantCount: 5,
                patients: [
                  { id: 'p1', name: 'John Doe', compliance: 45 },
                  { id: 'p2', name: 'Jane Smith', compliance: 62 }
                ]
              },
              duration
            }
          }
          return {
            status: 'success',
            output: { compliance: 85, daysUsed: 25, averageHours: 6.5 },
            duration
          }
        
        case 'sleep-clinic-dme':
          if (node.data.config.action === 'check-inventory') {
            return {
              status: 'success',
              output: {
                available: 12,
                equipment: [
                  { id: 'eq1', name: 'CPAP Machine', serial: 'CPAP-001' }
                ]
              },
              duration
            }
          }
          return {
            status: 'success',
            output: { assigned: true, inventoryId: 'inv-123' },
            duration
          }
        
        case 'sleep-clinic-sleep-study':
          if (node.data.config.action === 'dispatch') {
            return {
              status: 'success',
              output: {
                dispatched: true,
                monitorSerial: 'MON-001',
                estimatedReturn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              },
              duration
            }
          }
          return {
            status: 'success',
            output: { availableMonitors: 3, monitors: ['MON-001', 'MON-002'] },
            duration
          }
        
        case 'ai-agent':
          return {
            status: 'success',
            output: {
              response: 'AI agent processed the request successfully',
              tokens: 150,
              cost: 0.002
            },
            duration: duration * 3 // AI takes longer
          }
        
        case 'delay':
          const delayMs = node.data.config.delayMs || 1000
          return {
            status: 'success',
            output: { delayed: delayMs },
            duration: delayMs
          }
        
        default:
          return {
            status: 'success',
            output: { processed: true, nodeType: node.data.type },
            duration
          }
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      }
    }
  }

  private static simulateCondition(
    node: VisualWorkflowNode,
    inputData: Record<string, any>
  ): boolean {
    const config = node.data.config || {}
    const field = config.field || ''
    const operator = config.operator || 'equals'
    const value = config.value
    
    const fieldValue = inputData[field]
    
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

  private static getExecutionOrder(
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

  /**
   * Estimate workflow performance
   */
  static estimatePerformance(workflow: VisualWorkflow): {
    estimatedDuration: number
    estimatedCost: number
    complexity: 'low' | 'medium' | 'high'
  } {
    let totalDuration = 0
    let totalCost = 0
    let complexityScore = 0
    
    workflow.nodes.forEach(node => {
      // Base duration estimates
      const baseDuration = 200 // ms
      totalDuration += baseDuration
      
      // Cost estimates (for AI nodes)
      if (node.data.type === 'ai-agent') {
        totalCost += 0.002 // $0.002 per AI call
        complexityScore += 3
      } else if (node.data.type === 'api-call') {
        totalCost += 0.0001
        complexityScore += 2
      } else {
        complexityScore += 1
      }
      
      // Additional duration for specific types
      if (node.data.type === 'delay') {
        totalDuration += (node.data.config.delayMs || 1000)
      } else if (node.data.type === 'database') {
        totalDuration += 100
      }
    })
    
    const complexity: 'low' | 'medium' | 'high' = 
      complexityScore < 5 ? 'low' :
      complexityScore < 10 ? 'medium' : 'high'
    
    return {
      estimatedDuration: totalDuration,
      estimatedCost: totalCost,
      complexity
    }
  }
}
