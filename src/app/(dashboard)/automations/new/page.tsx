/**
 * New Workflow Editor Page
 * Visual workflow builder with split-pane UI (Visual | Code | Preview | AI)
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge, WorkflowNodeType } from '@/types/workflow-visual'
import { VisualWorkflowBuilder } from '@/components/workflow/visual-builder'
import { NodePalette } from '@/components/workflow/node-palette'
import { NodeEditor } from '@/components/workflow/node-editor'
import { CodePreview } from '@/components/workflow/code-preview'
import { OutcomePreview } from '@/components/workflow/outcome-preview'
import { AIAssistantPanel } from '@/components/workflow/ai-assistant-panel'
import { WorkflowNodeValidator } from '@/lib/workflow/node-validator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Save, Play, Zap, Code, Eye, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'
import { v4 as uuidv4 } from 'uuid'

export default function NewWorkflowPage() {
  const { skin } = useSkin()
  const [workflow, setWorkflow] = useState<VisualWorkflow>({
    id: uuidv4(),
    name: 'New Workflow',
    description: '',
    nodes: [],
    edges: [],
    version: 1,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedNode, setSelectedNode] = useState<VisualWorkflowNode | null>(null)
  const [validationIssues, setValidationIssues] = useState<Array<{
    severity: 'error' | 'warning' | 'info'
    message: string
    nodeId?: string
    suggestion?: string
  }>>([])

  const handleNodeSelect = useCallback((nodeType: WorkflowNodeType) => {
    // Add node at center of viewport
    const position = { x: 400, y: 300 }
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
    
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toISOString()
    }))
  }, [])
  
  // Helper functions
  const getNodeLabel = (nodeType: WorkflowNodeType): string => {
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
  
  const getNodeDescription = (nodeType: WorkflowNodeType): string => {
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

  const handleWorkflowChange = useCallback((changes: Partial<VisualWorkflow>) => {
    setWorkflow(prev => {
      const updated = {
        ...prev,
        ...changes,
        updatedAt: new Date().toISOString()
      }
      // Validate workflow
      const issues = WorkflowNodeValidator.validateWorkflow(updated)
      setValidationIssues(issues)
      return updated
    })
  }, [])

  const handleNodeConfigSave = useCallback((nodeId: string, config: Record<string, any>) => {
    setWorkflow(prev => {
      const updatedNodes = prev.nodes.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, config, label: config.label || n.data.label } }
          : n
      )
      const updated = {
        ...prev,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString()
      }
      // Re-validate
      const issues = WorkflowNodeValidator.validateWorkflow(updated)
      setValidationIssues(issues)
      setSelectedNode(null)
      return updated
    })
  }, [])

  const handleSave = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      })
      
      if (response.ok) {
        // Redirect to workflow list or detail page
        window.location.href = '/automations'
      }
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  return (
    <div className={cn(
      "h-screen flex flex-col",
      skin === "legacy" ? "bg-slate-50" : "bg-transparent"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        skin === "legacy" ? "bg-white border-slate-200" : "aeterna-glass border-white/10"
      )}>
        <div className="flex items-center gap-4 flex-1">
          <Input
            value={workflow.name}
            onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Workflow Name"
            className={cn(
              "text-lg font-black border-0 bg-transparent focus-visible:ring-0 px-0",
              skin === "legacy" ? "text-slate-900" : "text-foreground"
            )}
          />
          <Textarea
            value={workflow.description || ''}
            onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description..."
            className={cn(
              "text-sm border-0 bg-transparent focus-visible:ring-0 px-0 resize-none",
              skin === "legacy" ? "text-slate-600" : "text-foreground/60",
              "max-w-md"
            )}
            rows={1}
          />
        </div>
        <div className="flex items-center gap-2">
          {validationIssues.some(i => i.severity === 'error') && (
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-black",
              skin === "legacy" ? "bg-red-50 text-red-800" : "bg-red-500/10 text-red-400"
            )}>
              {validationIssues.filter(i => i.severity === 'error').length} Error(s)
            </div>
          )}
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button 
            onClick={handleSave} 
            size="sm"
            disabled={validationIssues.some(i => i.severity === 'error')}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <NodePalette 
          onNodeSelect={handleNodeSelect}
          selectedCategory={selectedCategory}
        />

        {/* Visual Builder */}
        <div className="flex-1 relative">
          <VisualWorkflowBuilder
            workflow={workflow}
            onWorkflowChange={handleWorkflowChange}
            onNodeSelect={setSelectedNode}
            readOnly={false}
          />
        </div>

        {/* Node Editor Sidebar */}
        {selectedNode && (
          <div className="border-l">
            <NodeEditor
              node={selectedNode}
              onSave={handleNodeConfigSave}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}

        {/* Right Panel - Code, Preview, AI */}
        <div className={cn(
          "w-96 border-l flex flex-col",
          skin === "legacy" ? "bg-white border-slate-200" : "aeterna-glass border-white/10"
        )}>
          <Tabs defaultValue="code" className="h-full flex flex-col">
            <TabsList className={cn(
              "w-full rounded-none border-b",
              skin === "legacy" ? "bg-slate-50" : "bg-white/[0.02]"
            )}>
              <TabsTrigger value="code" className="flex-1">
                <Code className="h-3 w-3 mr-1" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">
                <Brain className="h-3 w-3 mr-1" />
                AI
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
              <CodePreview workflow={workflow} />
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
              <OutcomePreview workflow={workflow} />
            </TabsContent>
            
            <TabsContent value="ai" className="flex-1 m-0 overflow-hidden">
              <AIAssistantPanel 
                workflow={workflow}
                onSuggestionApply={(suggestion) => {
                  // Apply suggestion to workflow
                  console.log('Apply suggestion:', suggestion)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
