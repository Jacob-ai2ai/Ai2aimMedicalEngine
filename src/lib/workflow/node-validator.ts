/**
 * Node Validator Service
 * Validates workflow structure and node configurations
 */

import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge } from '@/types/workflow-visual'

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
  nodeId?: string
  edgeId?: string
  suggestion?: string
}

export class WorkflowNodeValidator {
  /**
   * Validate entire workflow
   */
  static validateWorkflow(workflow: VisualWorkflow): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    
    // Check for trigger node
    const hasTrigger = workflow.nodes.some(n => n.data.type === 'trigger')
    if (!hasTrigger) {
      issues.push({
        severity: 'error',
        message: 'Workflow must have at least one trigger node',
        suggestion: 'Add a trigger node as the starting point'
      })
    }
    
    // Validate each node
    workflow.nodes.forEach(node => {
      const nodeIssues = this.validateNode(node, workflow)
      issues.push(...nodeIssues)
    })
    
    // Validate edges
    workflow.edges.forEach(edge => {
      const edgeIssues = this.validateEdge(edge, workflow)
      issues.push(...edgeIssues)
    })
    
    // Check for orphaned nodes
    const orphanedNodes = this.findOrphanedNodes(workflow)
    orphanedNodes.forEach(nodeId => {
      const node = workflow.nodes.find(n => n.id === nodeId)
      if (node && node.data.type !== 'trigger') {
        issues.push({
          severity: 'warning',
          message: `Node "${node.data.label}" has no incoming connections`,
          nodeId,
          suggestion: 'Connect this node to the workflow or remove it'
        })
      }
    })
    
    // Check for cycles
    const hasCycle = this.detectCycles(workflow.nodes, workflow.edges)
    if (hasCycle) {
      issues.push({
        severity: 'warning',
        message: 'Workflow contains cycles which may cause infinite loops',
        suggestion: 'Review connections to ensure proper flow control'
      })
    }
    
    // Check for disconnected components
    const components = this.findConnectedComponents(workflow.nodes, workflow.edges)
    if (components.length > 1) {
      issues.push({
        severity: 'warning',
        message: `Workflow has ${components.length} disconnected components`,
        suggestion: 'Connect all nodes to ensure complete workflow execution'
      })
    }
    
    return issues
  }

  /**
   * Validate a single node
   */
  static validateNode(node: VisualWorkflowNode, workflow: VisualWorkflow): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const config = node.data.config || {}
    
    // Check required configuration based on node type
    switch (node.data.type) {
      case 'trigger':
        if (!config.triggerType) {
          issues.push({
            severity: 'error',
            message: `Trigger node "${node.data.label}" is missing trigger type`,
            nodeId: node.id,
            suggestion: 'Configure the trigger type (event, schedule, or webhook)'
          })
        }
        if (config.triggerType === 'event' && !config.eventType) {
          issues.push({
            severity: 'error',
            message: `Event trigger "${node.data.label}" is missing event type`,
            nodeId: node.id,
            suggestion: 'Specify the event type (e.g., sleep_study.created)'
          })
        }
        if (config.triggerType === 'schedule' && config.schedule === 'daily' && config.hour === undefined) {
          issues.push({
            severity: 'warning',
            message: `Schedule trigger "${node.data.label}" should specify an hour`,
            nodeId: node.id,
            suggestion: 'Set the hour (0-23) for daily schedule'
          })
        }
        break

      case 'database':
        if (!config.table) {
          issues.push({
            severity: 'error',
            message: `Database node "${node.data.label}" is missing table name`,
            nodeId: node.id,
            suggestion: 'Specify the database table name'
          })
        }
        if (!config.operation) {
          issues.push({
            severity: 'error',
            message: `Database node "${node.data.label}" is missing operation`,
            nodeId: node.id,
            suggestion: 'Specify the operation (select, insert, update, delete)'
          })
        }
        break

      case 'api-call':
        if (!config.url) {
          issues.push({
            severity: 'error',
            message: `API Call node "${node.data.label}" is missing URL`,
            nodeId: node.id,
            suggestion: 'Specify the API endpoint URL'
          })
        }
        break

      case 'notification':
        if (!config.recipient) {
          issues.push({
            severity: 'error',
            message: `Notification node "${node.data.label}" is missing recipient`,
            nodeId: node.id,
            suggestion: 'Specify the notification recipient'
          })
        }
        if (!config.message) {
          issues.push({
            severity: 'error',
            message: `Notification node "${node.data.label}" is missing message`,
            nodeId: node.id,
            suggestion: 'Specify the notification message'
          })
        }
        break

      case 'condition':
        if (!config.field) {
          issues.push({
            severity: 'error',
            message: `Condition node "${node.data.label}" is missing field`,
            nodeId: node.id,
            suggestion: 'Specify the field to check'
          })
        }
        if (!config.operator) {
          issues.push({
            severity: 'error',
            message: `Condition node "${node.data.label}" is missing operator`,
            nodeId: node.id,
            suggestion: 'Specify the comparison operator'
          })
        }
        if (config.value === undefined || config.value === null) {
          issues.push({
            severity: 'warning',
            message: `Condition node "${node.data.label}" should specify a value`,
            nodeId: node.id,
            suggestion: 'Specify the comparison value'
          })
        }
        break

      case 'delay':
        if (!config.delayMs || config.delayMs < 0) {
          issues.push({
            severity: 'warning',
            message: `Delay node "${node.data.label}" should specify a positive delay`,
            nodeId: node.id,
            suggestion: 'Set delay in milliseconds (e.g., 1000 for 1 second)'
          })
        }
        break

      case 'sleep-clinic-cpap':
        if (!config.action) {
          issues.push({
            severity: 'error',
            message: `CPAP node "${node.data.label}" is missing action`,
            nodeId: node.id,
            suggestion: 'Specify the action (check-compliance, sync-data, calculate)'
          })
        }
        break

      case 'sleep-clinic-dme':
        if (!config.action) {
          issues.push({
            severity: 'error',
            message: `DME node "${node.data.label}" is missing action`,
            nodeId: node.id,
            suggestion: 'Specify the action (check-inventory, assign, get-inventory)'
          })
        }
        break

      case 'sleep-clinic-sleep-study':
        if (!config.action) {
          issues.push({
            severity: 'error',
            message: `Sleep Study node "${node.data.label}" is missing action`,
            nodeId: node.id,
            suggestion: 'Specify the action (dispatch, return, get-available)'
          })
        }
        break

      case 'sleep-clinic-pft':
        if (!config.action) {
          issues.push({
            severity: 'error',
            message: `PFT node "${node.data.label}" is missing action`,
            nodeId: node.id,
            suggestion: 'Specify the action (schedule, record-results, get-tests)'
          })
        }
        break

      case 'ai-agent':
        if (!config.agentRole) {
          issues.push({
            severity: 'error',
            message: `AI Agent node "${node.data.label}" is missing agent role`,
            nodeId: node.id,
            suggestion: 'Specify the agent role (physician, nurse, administrative)'
          })
        }
        if (!config.message) {
          issues.push({
            severity: 'warning',
            message: `AI Agent node "${node.data.label}" should specify a message`,
            nodeId: node.id,
            suggestion: 'Specify the message to send to the AI agent'
          })
        }
        break
    }
    
    // Check for empty label
    if (!node.data.label || node.data.label.trim() === '') {
      issues.push({
        severity: 'warning',
        message: `Node has no label`,
        nodeId: node.id,
        suggestion: 'Add a descriptive label for this node'
      })
    }
    
    return issues
  }

  /**
   * Validate an edge
   */
  static validateEdge(edge: VisualWorkflowEdge, workflow: VisualWorkflow): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    
    // Check if source node exists
    const sourceNode = workflow.nodes.find(n => n.id === edge.source)
    if (!sourceNode) {
      issues.push({
        severity: 'error',
        message: `Edge references non-existent source node: ${edge.source}`,
        edgeId: edge.id,
        suggestion: 'Remove this edge or fix the source node reference'
      })
    }
    
    // Check if target node exists
    const targetNode = workflow.nodes.find(n => n.id === edge.target)
    if (!targetNode) {
      issues.push({
        severity: 'error',
        message: `Edge references non-existent target node: ${edge.target}`,
        edgeId: edge.id,
        suggestion: 'Remove this edge or fix the target node reference'
      })
    }
    
    // Check for self-loops (may be intentional, so warning not error)
    if (edge.source === edge.target) {
      issues.push({
        severity: 'warning',
        message: `Edge creates a self-loop on node`,
        edgeId: edge.id,
        suggestion: 'Ensure this is intentional to avoid infinite loops'
      })
    }
    
    return issues
  }

  /**
   * Find orphaned nodes (no incoming connections except triggers)
   */
  private static findOrphanedNodes(workflow: VisualWorkflow): string[] {
    const orphaned: string[] = []
    
    workflow.nodes.forEach(node => {
      const hasIncoming = workflow.edges.some(e => e.target === node.id)
      if (!hasIncoming && node.data.type !== 'trigger') {
        orphaned.push(node.id)
      }
    })
    
    return orphaned
  }

  /**
   * Detect cycles in workflow graph
   */
  private static detectCycles(
    nodes: VisualWorkflowNode[],
    edges: VisualWorkflowEdge[]
  ): boolean {
    const visited = new Set<string>()
    const recStack = new Set<string>()
    
    const hasCycle = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true
      if (visited.has(nodeId)) return false
      
      visited.add(nodeId)
      recStack.add(nodeId)
      
      const outgoing = edges.filter(e => e.source === nodeId)
      for (const edge of outgoing) {
        if (hasCycle(edge.target)) return true
      }
      
      recStack.delete(nodeId)
      return false
    }
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) return true
      }
    }
    
    return false
  }

  /**
   * Find connected components
   */
  private static findConnectedComponents(
    nodes: VisualWorkflowNode[],
    edges: VisualWorkflowEdge[]
  ): string[][] {
    const visited = new Set<string>()
    const components: string[][] = []
    
    const dfs = (nodeId: string, component: string[]) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      component.push(nodeId)
      
      const outgoing = edges.filter(e => e.source === nodeId)
      outgoing.forEach(edge => {
        if (!visited.has(edge.target)) {
          dfs(edge.target, component)
        }
      })
      
      const incoming = edges.filter(e => e.target === nodeId)
      incoming.forEach(edge => {
        if (!visited.has(edge.source)) {
          dfs(edge.source, component)
        }
      })
    }
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const component: string[] = []
        dfs(node.id, component)
        if (component.length > 0) {
          components.push(component)
        }
      }
    })
    
    return components
  }

  /**
   * Check if workflow is valid (no errors)
   */
  static isValid(workflow: VisualWorkflow): boolean {
    const issues = this.validateWorkflow(workflow)
    return !issues.some(issue => issue.severity === 'error')
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(workflow: VisualWorkflow): {
    isValid: boolean
    errorCount: number
    warningCount: number
    infoCount: number
  } {
    const issues = this.validateWorkflow(workflow)
    return {
      isValid: !issues.some(issue => issue.severity === 'error'),
      errorCount: issues.filter(i => i.severity === 'error').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
      infoCount: issues.filter(i => i.severity === 'info').length
    }
  }
}
