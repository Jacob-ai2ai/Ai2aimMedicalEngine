/**
 * Code Generator Service
 * Converts visual workflow graphs to executable TypeScript code
 */

import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge, WorkflowCodePreview } from '@/types/workflow-visual'

export class WorkflowCodeGenerator {
  /**
   * Generate TypeScript code from visual workflow
   */
  static generateCode(workflow: VisualWorkflow): WorkflowCodePreview {
    const imports = new Set<string>()
    const functions: string[] = []
    
    // Find trigger node (should be first)
    const triggerNode = workflow.nodes.find(n => n.type === 'trigger')
    if (!triggerNode) {
      throw new Error('Workflow must have a trigger node')
    }

    // Build function name
    const functionName = this.sanitizeFunctionName(workflow.name)
    
    // Generate imports based on node types
    this.collectImports(workflow.nodes, imports)
    
    // Generate main workflow function
    const mainFunction = this.generateWorkflowFunction(workflow, functionName, triggerNode)
    functions.push(mainFunction)
    
    // Generate helper functions for each node type
    const helperFunctions = this.generateHelperFunctions(workflow.nodes)
    functions.push(...helperFunctions)
    
    // Combine code
    const importStatements = Array.from(imports).sort().join('\n')
    const code = `${importStatements}\n\n${functions.join('\n\n')}`
    
    return {
      code,
      language: 'typescript',
      imports: Array.from(imports),
      functions: functions.map(f => {
        const match = f.match(/^(export\s+)?(async\s+)?function\s+(\w+)/)
        return match ? match[3] : 'unknown'
      })
    }
  }

  private static sanitizeFunctionName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase() || 'workflow'
  }

  private static collectImports(nodes: VisualWorkflowNode[], imports: Set<string>): void {
    nodes.forEach(node => {
      switch (node.data.type) {
        case 'database':
          imports.add("import { createServerSupabase } from '@/lib/supabase/server'")
          break
        case 'api-call':
          imports.add("import { NextRequest, NextResponse } from 'next/server'")
          break
        case 'ai-agent':
          imports.add("import { agentOrchestrator } from '@/lib/ai/orchestrator'")
          imports.add("import { UserRole } from '@/types/database'")
          break
        case 'sleep-clinic-cpap':
        case 'sleep-clinic-dme':
        case 'sleep-clinic-sleep-study':
        case 'sleep-clinic-pft':
        case 'sleep-clinic-compliance':
          imports.add("import { cpapComplianceService } from '@/lib/medical/cpap-compliance-service'")
          imports.add("import { dmeService } from '@/lib/medical/dme-service'")
          imports.add("import { sleepStudyService } from '@/lib/medical/sleep-study-service'")
          imports.add("import { pftService } from '@/lib/medical/pft-service'")
          break
      }
    })
  }

  private static generateWorkflowFunction(
    workflow: VisualWorkflow,
    functionName: string,
    triggerNode: VisualWorkflowNode
  ): string {
    const lines: string[] = []
    
    lines.push(`export async function ${functionName}(context: WorkflowContext): Promise<WorkflowResult> {`)
    lines.push(`  const startTime = Date.now()`)
    lines.push(`  const results: Record<string, any> = {}`)
    lines.push(`  `)
    
    // Generate trigger check
    lines.push(`  // Trigger: ${triggerNode.data.label}`)
    const triggerCode = this.generateNodeCode(triggerNode, 'context')
    lines.push(`  ${triggerCode}`)
    lines.push(`  `)
    
    // Build execution flow from edges
    const executionOrder = this.getExecutionOrder(workflow.nodes, workflow.edges, triggerNode.id)
    
    for (let i = 0; i < executionOrder.length; i++) {
      const nodeId = executionOrder[i]
      const node = workflow.nodes.find(n => n.id === nodeId)
      if (!node) continue
      
      const prevNodeId = i > 0 ? executionOrder[i - 1] : triggerNode.id
      const prevResult = `results['${prevNodeId}']`
      
      lines.push(`  // Step ${i + 1}: ${node.data.label}`)
      
      if (node.data.type === 'condition') {
        lines.push(`  if (${prevResult}?.condition) {`)
        const nodeCode = this.generateNodeCode(node, prevResult)
        lines.push(`    ${nodeCode.split('\n').join('\n    ')}`)
        lines.push(`  } else {`)
        lines.push(`    // Condition not met, skipping remaining steps`)
        lines.push(`    return { success: false, skipped: true }`)
        lines.push(`  }`)
      } else {
        const nodeCode = this.generateNodeCode(node, prevResult)
        lines.push(`  ${nodeCode}`)
      }
      
      lines.push(`  `)
    }
    
    lines.push(`  return {`)
    lines.push(`    success: true,`)
    lines.push(`    duration: Date.now() - startTime,`)
    lines.push(`    results`)
    lines.push(`  }`)
    lines.push(`}`)
    
    return lines.join('\n')
  }

  private static generateNodeCode(node: VisualWorkflowNode, inputVar: string): string {
    const config = node.data.config || {}
    
    switch (node.data.type) {
      case 'trigger':
        if (config.triggerType === 'event') {
          return `const triggerResult = await checkEventTrigger('${config.eventType}', context)`
        } else if (config.triggerType === 'schedule') {
          return `const triggerResult = await checkScheduleTrigger('${config.schedule}', context)`
        }
        return `const triggerResult = true`
        
      case 'database':
        const table = config.table || 'patients'
        const operation = config.operation || 'select'
        if (operation === 'select') {
          return `results['${node.id}'] = await supabase.from('${table}').select('*').eq('id', ${inputVar}?.id)`
        } else if (operation === 'update') {
          return `results['${node.id}'] = await supabase.from('${table}').update(${inputVar}).eq('id', ${inputVar}?.id)`
        }
        return `results['${node.id}'] = await supabase.from('${table}').insert(${inputVar})`
        
      case 'api-call':
        const method = config.method || 'POST'
        const url = config.url || ''
        return `results['${node.id}'] = await fetch('${url}', { method: '${method}', body: JSON.stringify(${inputVar}) })`
        
      case 'notification':
        const message = config.message || 'Notification'
        return `results['${node.id}'] = await sendNotification('${config.recipient}', '${message}', ${inputVar})`
        
      case 'condition':
        const field = config.field || ''
        const operator = config.operator || 'equals'
        const value = config.value || ''
        return `const condition = checkCondition(${inputVar}?.${field}, '${operator}', '${value}')`
        
      case 'delay':
        const delayMs = config.delayMs || 1000
        return `await new Promise(resolve => setTimeout(resolve, ${delayMs}))`
        
      case 'sleep-clinic-cpap':
        if (config.action === 'check-compliance') {
          return `results['${node.id}'] = await cpapComplianceService.getNonCompliantPatients(${config.days || 21})`
        } else if (config.action === 'sync-data') {
          return `results['${node.id}'] = await cpapComplianceService.importResMedData(${inputVar}?.patientId, ${inputVar}?.data)`
        }
        return `results['${node.id}'] = await cpapComplianceService.calculateMonthlyCompliance(${inputVar}?.patientId)`
        
      case 'sleep-clinic-dme':
        if (config.action === 'check-inventory') {
          return `results['${node.id}'] = await dmeService.getAvailableEquipment('${config.equipmentType || ''}')`
        } else if (config.action === 'assign') {
          return `results['${node.id}'] = await dmeService.assignEquipmentToPatient(${inputVar}?.inventoryId, ${inputVar}?.patientId)`
        }
        return `results['${node.id}'] = await dmeService.getInventoryForEquipment(${inputVar}?.equipmentId)`
        
      case 'sleep-clinic-sleep-study':
        if (config.action === 'dispatch') {
          return `results['${node.id}'] = await sleepStudyService.dispatchMonitor(${inputVar}?.studyId, ${inputVar}?.serialNumber)`
        } else if (config.action === 'return') {
          return `results['${node.id}'] = await sleepStudyService.recordReturn(${inputVar}?.studyId)`
        }
        return `results['${node.id}'] = await sleepStudyService.getAvailableMonitors()`
        
      case 'sleep-clinic-pft':
        if (config.action === 'schedule') {
          return `results['${node.id}'] = await pftService.createPFTTest({ patientId: ${inputVar}?.patientId, testType: '${config.testType || 'spirometry'}' })`
        } else if (config.action === 'record-results') {
          return `results['${node.id}'] = await pftService.recordPFTResults(${inputVar}?.testId, ${inputVar}?.results)`
        }
        return `results['${node.id}'] = await pftService.getPatientPFTTests(${inputVar}?.patientId)`
        
      case 'ai-agent':
        const agentRole = config.agentRole || 'physician'
        const agentMessage = config.message || 'Process request'
        return `results['${node.id}'] = await agentOrchestrator.routeToAgent('${agentRole}', '${agentMessage}', ${inputVar})`
        
      default:
        return `results['${node.id}'] = { processed: true, input: ${inputVar} }`
    }
  }

  private static generateHelperFunctions(nodes: VisualWorkflowNode[]): string[] {
    const functions: string[] = []
    const addedHelpers = new Set<string>()
    
    nodes.forEach(node => {
      if (node.data.type === 'trigger' && !addedHelpers.has('checkEventTrigger')) {
        functions.push(this.generateTriggerHelpers())
        addedHelpers.add('checkEventTrigger')
        addedHelpers.add('checkScheduleTrigger')
      }
    })
    
    // Add common helper types
    if (!addedHelpers.has('types')) {
      functions.push(`interface WorkflowContext {
  [key: string]: any
}

interface WorkflowResult {
  success: boolean
  duration?: number
  results?: Record<string, any>
  skipped?: boolean
  error?: string
}`)
    }
    
    return functions
  }

  private static generateTriggerHelpers(): string {
    return `async function checkEventTrigger(eventType: string, context: WorkflowContext): Promise<boolean> {
  // Check if event matches trigger
  return context.eventType === eventType
}

async function checkScheduleTrigger(schedule: string, context: WorkflowContext): Promise<boolean> {
  // Check if schedule condition is met
  const now = new Date()
  if (schedule === 'daily') {
    return now.getHours() === (context.hour || 0)
  }
  return true
}

function checkCondition(value: any, operator: string, expected: any): boolean {
  switch (operator) {
    case 'equals': return value === expected
    case 'not_equals': return value !== expected
    case 'greater_than': return Number(value) > Number(expected)
    case 'less_than': return Number(value) < Number(expected)
    case 'contains': return String(value).includes(String(expected))
    default: return false
  }
}

async function sendNotification(recipient: string, message: string, data: any): Promise<any> {
  // Implementation for sending notification
  return { sent: true, recipient, message }
}`
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
      if (visited.has(nextNodeId)) break // Prevent cycles
      
      order.push(nextNodeId)
      visited.add(nextNodeId)
      currentId = nextNodeId
    }
    
    return order
  }
}
