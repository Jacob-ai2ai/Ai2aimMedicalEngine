/**
 * Visual Workflow Builder Types
 * Types for the node-based visual workflow system
 */

import { Node, Edge } from '@xyflow/react'

export type WorkflowNodeType = 
  | 'trigger'
  | 'action'
  | 'condition'
  | 'delay'
  | 'loop'
  | 'merge'
  | 'split'
  | 'ai-agent'
  | 'api-call'
  | 'database'
  | 'notification'
  | 'sleep-clinic-cpap'
  | 'sleep-clinic-dme'
  | 'sleep-clinic-sleep-study'
  | 'sleep-clinic-pft'
  | 'sleep-clinic-compliance'
  | 'sleep-clinic-referral'

export interface WorkflowNodeData {
  label: string
  type: WorkflowNodeType
  config: Record<string, any>
  description?: string
  icon?: string
  color?: string
}

export interface VisualWorkflowNode extends Node<WorkflowNodeData> {
  type: 'workflowNode'
}

export interface VisualWorkflowEdge extends Edge {
  type?: 'default' | 'smoothstep' | 'step'
}

export interface VisualWorkflow {
  id: string
  name: string
  description?: string
  nodes: VisualWorkflowNode[]
  edges: VisualWorkflowEdge[]
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface WorkflowExecutionPreview {
  step: number
  nodeId: string
  nodeLabel: string
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped'
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
  duration?: number
}

export interface WorkflowCodePreview {
  code: string
  language: 'typescript'
  imports: string[]
  functions: string[]
}

export interface AIWorkflowSuggestion {
  suggestion: string
  nodes: Partial<VisualWorkflowNode>[]
  confidence: number
  reasoning: string
  references?: string[] // RAG document references
}
