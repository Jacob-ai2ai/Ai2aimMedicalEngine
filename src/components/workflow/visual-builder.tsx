/**
 * Visual Workflow Builder Component
 * Main React Flow-based visual workflow editor
 */

'use client'

import React, { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge, WorkflowNodeType } from '@/types/workflow-visual'
import { WorkflowNode } from './nodes/workflow-node'
import { WorkflowEdge } from './edges/workflow-edge'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode
}

const edgeTypes: EdgeTypes = {
  default: WorkflowEdge
}

interface VisualBuilderProps {
  workflow?: VisualWorkflow
  onWorkflowChange?: (workflow: Partial<VisualWorkflow>) => void
  onNodeSelect?: (node: VisualWorkflowNode) => void
  readOnly?: boolean
}

export function VisualWorkflowBuilder({ 
  workflow, 
  onWorkflowChange,
  onNodeSelect,
  readOnly = false 
}: VisualBuilderProps) {
  const { skin } = useSkin()
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.nodes || []
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.edges || []
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: VisualWorkflowEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: skin === 'legacy' ? '#10b981' : '#10b981'
        }
      }
      setEdges((eds) => addEdge(newEdge, eds))
      
      if (onWorkflowChange) {
        onWorkflowChange({
          nodes: nodes as VisualWorkflowNode[],
          edges: [...edges, newEdge]
        })
      }
    },
    [nodes, edges, setEdges, onWorkflowChange, skin]
  )

  const addNode = useCallback((nodeType: WorkflowNodeType, position: { x: number; y: number }) => {
    const newNode: VisualWorkflowNode = {
      id: `node-${Date.now()}`,
      type: 'workflowNode',
      position,
      data: {
        label: getNodeLabel(nodeType),
        type: nodeType,
        config: {},
        description: getNodeDescription(nodeType)
      }
    }
    
    setNodes((nds) => [...nds, newNode])
    
    if (onWorkflowChange) {
      onWorkflowChange({
        nodes: [...nodes, newNode] as VisualWorkflowNode[],
        edges
      })
    }
  }, [nodes, edges, setNodes, onWorkflowChange])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId))
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    
    if (onWorkflowChange) {
      onWorkflowChange({
        nodes: nodes.filter(n => n.id !== nodeId) as VisualWorkflowNode[],
        edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId)
      })
    }
  }, [nodes, edges, setNodes, setEdges, onWorkflowChange])

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((nds) => nds.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
        : n
    ))
    
    if (onWorkflowChange) {
      const updatedNodes = nodes.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
          : n
      ) as VisualWorkflowNode[]
      
      onWorkflowChange({
        nodes: updatedNodes,
        edges
      })
    }
  }, [nodes, edges, setNodes, onWorkflowChange])

  // Expose methods via ref (if needed)
  React.useImperativeHandle(React.useRef(), () => ({
    addNode,
    deleteNode,
    updateNodeConfig
  }), [addNode, deleteNode, updateNodeConfig])

  const flowBackgroundColor = skin === 'legacy' ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)'
  const flowGridColor = skin === 'legacy' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)'

  return (
    <div className={cn(
      "w-full h-full",
      skin === "legacy" ? "bg-slate-50" : "bg-transparent"
    )}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(event, node) => {
          if (onNodeSelect && !readOnly) {
            onNodeSelect(node as VisualWorkflowNode)
          }
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: skin === 'legacy' ? '#10b981' : '#10b981'
          }
        }}
        className={cn(
          skin === "legacy" ? "bg-slate-50" : "bg-transparent"
        )}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color={flowGridColor}
        />
        <Controls 
          className={cn(
            skin === "legacy" 
              ? "bg-white border-slate-200" 
              : "aeterna-glass border-white/10"
          )}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'trigger') return '#f59e0b'
            if (node.data?.type?.includes('sleep-clinic')) return '#3b82f6'
            return '#10b981'
          }}
          className={cn(
            skin === "legacy" 
              ? "bg-white border-slate-200" 
              : "aeterna-glass border-white/10"
          )}
          maskColor={skin === 'legacy' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.5)'}
        />
      </ReactFlow>
    </div>
  )
}

// Helper functions
function getNodeLabel(nodeType: WorkflowNodeType): string {
  const labels: Record<WorkflowNodeType, string> = {
    'trigger': 'Trigger',
    'action': 'Action',
    'condition': 'Condition',
    'delay': 'Delay',
    'loop': 'Loop',
    'merge': 'Merge',
    'split': 'Split',
    'ai-agent': 'AI Agent',
    'api-call': 'API Call',
    'database': 'Database',
    'notification': 'Notification',
    'sleep-clinic-cpap': 'CPAP Compliance',
    'sleep-clinic-dme': 'DME Equipment',
    'sleep-clinic-sleep-study': 'Sleep Study',
    'sleep-clinic-pft': 'PFT Test',
    'sleep-clinic-compliance': 'Compliance Check',
    'sleep-clinic-referral': 'Referral'
  }
  return labels[nodeType] || nodeType
}

function getNodeDescription(nodeType: WorkflowNodeType): string {
  const descriptions: Record<WorkflowNodeType, string> = {
    'trigger': 'Start workflow on event or schedule',
    'action': 'Execute an action',
    'condition': 'Conditional branching',
    'delay': 'Wait for specified time',
    'loop': 'Repeat actions',
    'merge': 'Merge parallel branches',
    'split': 'Split into parallel branches',
    'ai-agent': 'Invoke AI agent',
    'api-call': 'Call external API',
    'database': 'Query or update database',
    'notification': 'Send notification',
    'sleep-clinic-cpap': 'Check CPAP compliance or sync data',
    'sleep-clinic-dme': 'Manage DME equipment and inventory',
    'sleep-clinic-sleep-study': 'Dispatch or manage sleep studies',
    'sleep-clinic-pft': 'Schedule or process PFT tests',
    'sleep-clinic-compliance': 'Check patient compliance',
    'sleep-clinic-referral': 'Process referral forms'
  }
  return descriptions[nodeType] || ''
}

