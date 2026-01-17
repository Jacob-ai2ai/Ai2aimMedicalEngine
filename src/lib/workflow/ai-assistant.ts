/**
 * AI Workflow Assistant
 * Provides AI-powered suggestions and auto-configuration for workflows
 * Uses RAG to reference system documentation and existing workflows
 */

// import { RAGService } from '@/lib/ai/rag-service' // Temporarily disabled for client compatibility
import { OpenAIClient } from '@/lib/ai/openai-client'
import { VisualWorkflow, VisualWorkflowNode, AIWorkflowSuggestion } from '@/types/workflow-visual'

export class WorkflowAIAssistant {
  /**
   * Convert natural language to workflow suggestion
   */
  static async suggestWorkflowFromText(
    description: string,
    existingWorkflows: VisualWorkflow[] = []
  ): Promise<AIWorkflowSuggestion> {
    // Get relevant context from RAG (temporarily using placeholder)
    const context = '' // await RAGService.getRelevantContext(`Create workflow: ${description}`, 3000)
    
    // Get system API documentation
    const apiDocs = await this.getAPIDocumentation()
    
    // Build prompt for AI
    const prompt = this.buildSuggestionPrompt(description, context, apiDocs, existingWorkflows)
    
    // Call OpenAI
    const response = await OpenAIClient.chat([
      {
        role: 'system',
        content: 'You are an expert workflow automation assistant for a medical sleep clinic platform. Generate workflow suggestions based on natural language descriptions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ], {
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000
    })
    
    // Parse AI response
    return this.parseAISuggestion(response.content, description)
  }

  /**
   * Auto-configure a node based on context
   */
  static async autoConfigureNode(
    node: VisualWorkflowNode,
    workflowContext: VisualWorkflow
  ): Promise<Partial<VisualWorkflowNode>> {
    // Get relevant system documentation (temporarily using placeholder)
    const context = '' // await RAGService.getRelevantContext(`Configure ${node.data.type} node for ${node.data.label}`, 2000)
    
    // Get similar nodes from existing workflows
    const similarNodes = this.findSimilarNodes(node, workflowContext)
    
    // Build configuration suggestion
    const config = await this.suggestNodeConfiguration(node, context, similarNodes)
    
    return {
      data: {
        ...node.data,
        config: {
          ...node.data.config,
          ...config
        }
      }
    }
  }

  /**
   * Detect potential issues in workflow
   */
  static async detectIssues(workflow: VisualWorkflow): Promise<Array<{
    severity: 'error' | 'warning' | 'info'
    message: string
    nodeId?: string
    suggestion?: string
  }>> {
    const issues: Array<{
      severity: 'error' | 'warning' | 'info'
      message: string
      nodeId?: string
      suggestion?: string
    }> = []
    
    // Check for trigger node
    const hasTrigger = workflow.nodes.some(n => n.type === 'trigger')
    if (!hasTrigger) {
      issues.push({
        severity: 'error',
        message: 'Workflow must have a trigger node',
        suggestion: 'Add a trigger node as the first node'
      })
    }
    
    // Check for orphaned nodes (no connections)
    workflow.nodes.forEach(node => {
      const hasIncoming = workflow.edges.some(e => e.target === node.id)
      const hasOutgoing = workflow.edges.some(e => e.source === node.id)
      
      if (!hasIncoming && node.type !== 'trigger') {
        issues.push({
          severity: 'warning',
          message: `Node "${node.data.label}" has no incoming connections`,
          nodeId: node.id,
          suggestion: 'Connect this node to the workflow'
        })
      }
      
      if (!hasOutgoing && node.data.type !== 'notification' && node.data.type !== 'database') {
        issues.push({
          severity: 'info',
          message: `Node "${node.data.label}" has no outgoing connections`,
          nodeId: node.id,
          suggestion: 'Consider if this should be the final step'
        })
      }
    })
    
    // Check for cycles
    const hasCycle = this.detectCycles(workflow.nodes, workflow.edges)
    if (hasCycle) {
      issues.push({
        severity: 'warning',
        message: 'Workflow contains cycles which may cause infinite loops',
        suggestion: 'Review connections to ensure proper flow'
      })
    }
    
    // Check for missing required config
    workflow.nodes.forEach(node => {
      const missingConfig = this.checkRequiredConfig(node)
      if (missingConfig.length > 0) {
        issues.push({
          severity: 'error',
          message: `Node "${node.data.label}" is missing required configuration: ${missingConfig.join(', ')}`,
          nodeId: node.id,
          suggestion: 'Configure all required fields'
        })
      }
    })
    
    return issues
  }

  /**
   * Suggest workflow optimizations
   */
  static async suggestOptimizations(workflow: VisualWorkflow): Promise<Array<{
    type: 'merge' | 'parallel' | 'cache' | 'remove'
    description: string
    impact: 'low' | 'medium' | 'high'
    suggestion: string
  }>> {
    const optimizations: Array<{
      type: 'merge' | 'parallel' | 'cache' | 'remove'
      description: string
      impact: 'low' | 'medium' | 'high'
      suggestion: string
    }> = []
    
    // Check for sequential database calls that could be merged
    const dbNodes = workflow.nodes.filter(n => n.data.type === 'database')
    if (dbNodes.length > 2) {
      optimizations.push({
        type: 'merge',
        description: 'Multiple sequential database queries detected',
        impact: 'medium',
        suggestion: 'Consider combining queries or using parallel execution'
      })
    }
    
    // Check for parallelizable nodes
    const parallelizable = this.findParallelizableNodes(workflow.nodes, workflow.edges)
    if (parallelizable.length > 0) {
      optimizations.push({
        type: 'parallel',
        description: `${parallelizable.length} nodes could run in parallel`,
        impact: 'high',
        suggestion: 'Use split/merge nodes to enable parallel execution'
      })
    }
    
    return optimizations
  }

  private static async buildSuggestionPrompt(
    description: string,
    context: string,
    apiDocs: string,
    existingWorkflows: VisualWorkflow[]
  ): string {
    return `Create a workflow automation based on this description:

"${description}"

Available system context:
${context}

Available APIs:
${apiDocs}

Existing similar workflows:
${existingWorkflows.map(w => `- ${w.name}: ${w.description || ''}`).join('\n')}

Provide a JSON response with:
1. Suggested workflow name
2. List of nodes needed (with types and configurations)
3. Connections between nodes
4. Confidence score (0-1)
5. Reasoning for the suggestion`
  }

  private static parseAISuggestion(aiResponse: string, originalDescription: string): AIWorkflowSuggestion {
    try {
      // Try to parse JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          suggestion: parsed.suggestion || originalDescription,
          nodes: parsed.nodes || [],
          confidence: parsed.confidence || 0.7,
          reasoning: parsed.reasoning || 'AI-generated suggestion',
          references: parsed.references || []
        }
      }
    } catch (error) {
      console.error('Failed to parse AI suggestion:', error)
    }
    
    // Fallback
    return {
      suggestion: originalDescription,
      nodes: [],
      confidence: 0.5,
      reasoning: 'AI suggestion parsing failed, using fallback'
    }
  }

  private static async getAPIDocumentation(): Promise<string> {
    // In a real implementation, this would fetch API documentation
    // For now, return a summary of available endpoints
    return `
Available API Endpoints:
- /api/cpap/compliance/[patientId] - Get CPAP compliance
- /api/cpap/compliance/non-compliant - Get non-compliant patients
- /api/dme/equipment - DME equipment management
- /api/dme/inventory - DME inventory management
- /api/sleep-studies - Sleep study management
- /api/pft/tests - PFT test management
- /api/appointments - Appointment management
- /api/patients - Patient management
`
  }

  private static findSimilarNodes(
    node: VisualWorkflowNode,
    workflow: VisualWorkflow
  ): VisualWorkflowNode[] {
    return workflow.nodes.filter(n => 
      n.id !== node.id && 
      n.data.type === node.data.type
    )
  }

  private static async suggestNodeConfiguration(
    node: VisualWorkflowNode,
    context: string,
    similarNodes: VisualWorkflowNode[]
  ): Promise<Record<string, any>> {
    // Use similar nodes as reference
    if (similarNodes.length > 0) {
      return similarNodes[0].data.config || {}
    }
    
    // Default configurations based on node type
    const defaults: Record<string, Record<string, any>> = {
      'sleep-clinic-cpap': {
        action: 'check-compliance',
        days: 21
      },
      'sleep-clinic-dme': {
        action: 'check-inventory'
      },
      'notification': {
        recipient: 'clinician@example.com',
        message: 'Workflow notification'
      }
    }
    
    return defaults[node.data.type] || {}
  }

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

  private static checkRequiredConfig(node: VisualWorkflowNode): string[] {
    const required: string[] = []
    
    switch (node.data.type) {
      case 'api-call':
        if (!node.data.config.url) required.push('url')
        break
      case 'notification':
        if (!node.data.config.recipient) required.push('recipient')
        if (!node.data.config.message) required.push('message')
        break
      case 'condition':
        if (!node.data.config.field) required.push('field')
        if (!node.data.config.operator) required.push('operator')
        break
      case 'database':
        if (!node.data.config.table) required.push('table')
        if (!node.data.config.operation) required.push('operation')
        break
    }
    
    return required
  }

  private static findParallelizableNodes(
    nodes: VisualWorkflowNode[],
    edges: VisualWorkflowEdge[]
  ): string[] {
    // Find nodes that have the same source (can run in parallel)
    const sourceGroups = new Map<string, string[]>()
    
    edges.forEach(edge => {
      if (!sourceGroups.has(edge.source)) {
        sourceGroups.set(edge.source, [])
      }
      sourceGroups.get(edge.source)!.push(edge.target)
    })
    
    const parallelizable: string[] = []
    sourceGroups.forEach((targets, source) => {
      if (targets.length > 1) {
        parallelizable.push(...targets)
      }
    })
    
    return parallelizable
  }
}
