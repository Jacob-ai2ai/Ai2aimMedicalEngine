/**
 * Outcome Preview Component
 * Shows simulated execution results
 */

'use client'

import React, { useEffect, useState } from 'react'
import { VisualWorkflow, WorkflowExecutionPreview } from '@/types/workflow-visual'
import { WorkflowOutcomeSimulator } from '@/lib/workflow/outcome-simulator'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'
import { CheckCircle2, XCircle, Clock, SkipForward, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OutcomePreviewProps {
  workflow: VisualWorkflow
  sampleContext?: Record<string, any>
}

export function OutcomePreview({ workflow, sampleContext = {} }: OutcomePreviewProps) {
  const { skin } = useSkin()
  const [previews, setPreviews] = useState<WorkflowExecutionPreview[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [performance, setPerformance] = useState<{
    estimatedDuration: number
    estimatedCost: number
    complexity: 'low' | 'medium' | 'high'
  } | null>(null)

  const runSimulation = async () => {
    setIsSimulating(true)
    try {
      const results = await WorkflowOutcomeSimulator.simulate(workflow, sampleContext)
      setPreviews(results)
      
      const perf = WorkflowOutcomeSimulator.estimatePerformance(workflow)
      setPerformance(perf)
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  useEffect(() => {
    if (workflow.nodes.length > 0) {
      runSimulation()
    }
  }, [workflow])

  const getStatusIcon = (status: WorkflowExecutionPreview['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className={cn(
      "h-full flex flex-col",
      skin === "legacy" ? "bg-white" : "bg-transparent"
    )}>
      <div className={cn(
        "p-3 border-b flex items-center justify-between",
        skin === "legacy" ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
      )}>
        <h3 className={cn(
          "text-xs font-black uppercase tracking-widest",
          skin === "legacy" ? "text-slate-900" : "text-foreground"
        )}>
          Execution Preview
        </h3>
        <Button
          size="sm"
          onClick={runSimulation}
          disabled={isSimulating}
          className="h-7 text-xs"
        >
          <Play className="h-3 w-3 mr-1" />
          {isSimulating ? 'Simulating...' : 'Run Preview'}
        </Button>
      </div>

      {performance && (
        <div className={cn(
          "p-3 border-b grid grid-cols-3 gap-2 text-xs",
          skin === "legacy" ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
        )}>
          <div>
            <div className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
            )}>
              Duration
            </div>
            <div className={cn(
              "text-sm font-black mt-1",
              skin === "legacy" ? "text-slate-900" : "text-foreground"
            )}>
              {performance.estimatedDuration}ms
            </div>
          </div>
          <div>
            <div className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
            )}>
              Cost
            </div>
            <div className={cn(
              "text-sm font-black mt-1",
              skin === "legacy" ? "text-slate-900" : "text-foreground"
            )}>
              ${performance.estimatedCost.toFixed(4)}
            </div>
          </div>
          <div>
            <div className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
            )}>
              Complexity
            </div>
            <div className={cn(
              "text-sm font-black mt-1 capitalize",
              skin === "legacy" ? "text-slate-900" : "text-foreground"
            )}>
              {performance.complexity}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {previews.length === 0 ? (
          <div className={cn(
            "text-center py-8 text-sm",
            skin === "legacy" ? "text-slate-500" : "text-foreground/50"
          )}>
            Click "Run Preview" to simulate workflow execution
          </div>
        ) : (
          previews.map((preview, index) => (
            <div
              key={preview.nodeId}
              className={cn(
                "p-3 rounded-lg border",
                skin === "legacy"
                  ? "bg-white border-slate-200"
                  : "aeterna-glass border-white/10"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(preview.status)}
                <span className={cn(
                  "text-xs font-black",
                  skin === "legacy" ? "text-slate-900" : "text-foreground"
                )}>
                  Step {preview.step + 1}: {preview.nodeLabel}
                </span>
                {preview.duration && (
                  <span className={cn(
                    "text-[10px] ml-auto",
                    skin === "legacy" ? "text-slate-400" : "text-foreground/40"
                  )}>
                    {preview.duration}ms
                  </span>
                )}
              </div>
              
              {preview.input && Object.keys(preview.input).length > 0 && (
                <details className="mt-2">
                  <summary className={cn(
                    "text-[10px] font-bold cursor-pointer",
                    skin === "legacy" ? "text-slate-600" : "text-foreground/60"
                  )}>
                    Input
                  </summary>
                  <pre className={cn(
                    "text-[10px] mt-1 p-2 rounded overflow-auto",
                    skin === "legacy" ? "bg-slate-50" : "bg-white/5"
                  )}>
                    {JSON.stringify(preview.input, null, 2)}
                  </pre>
                </details>
              )}
              
              {preview.output && Object.keys(preview.output).length > 0 && (
                <details className="mt-2">
                  <summary className={cn(
                    "text-[10px] font-bold cursor-pointer",
                    skin === "legacy" ? "text-slate-600" : "text-foreground/60"
                  )}>
                    Output
                  </summary>
                  <pre className={cn(
                    "text-[10px] mt-1 p-2 rounded overflow-auto",
                    skin === "legacy" ? "bg-slate-50" : "bg-white/5"
                  )}>
                    {JSON.stringify(preview.output, null, 2)}
                  </pre>
                </details>
              )}
              
              {preview.error && (
                <div className={cn(
                  "mt-2 p-2 rounded text-[10px]",
                  skin === "legacy" ? "bg-red-50 text-red-800" : "bg-red-500/10 text-red-400"
                )}>
                  Error: {preview.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
