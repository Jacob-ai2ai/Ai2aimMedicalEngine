/**
 * Workflow Node Component
 * Custom node component for React Flow
 */

'use client'

import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { WorkflowNodeType } from '@/types/workflow-visual'
import { 
  Zap, 
  Database, 
  Globe, 
  Bell, 
  GitBranch, 
  Clock,
  Repeat,
  Merge,
  Split,
  Brain,
  Moon,
  Activity,
  Heart,
  FileText,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'

const NODE_ICONS: Record<WorkflowNodeType, React.ComponentType<{ className?: string }>> = {
  'trigger': Zap,
  'action': Zap,
  'condition': GitBranch,
  'delay': Clock,
  'loop': Repeat,
  'merge': Merge,
  'split': Split,
  'ai-agent': Brain,
  'api-call': Globe,
  'database': Database,
  'notification': Bell,
  'sleep-clinic-cpap': Moon,
  'sleep-clinic-dme': Activity,
  'sleep-clinic-sleep-study': Heart,
  'sleep-clinic-pft': CheckCircle2,
  'sleep-clinic-compliance': FileText,
  'sleep-clinic-referral': FileText
}

const NODE_COLORS: Record<WorkflowNodeType, string> = {
  'trigger': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  'action': 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  'condition': 'text-orange-500 bg-orange-500/10 border-orange-500/30',
  'delay': 'text-gray-500 bg-gray-500/10 border-gray-500/30',
  'loop': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
  'merge': 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
  'split': 'text-teal-500 bg-teal-500/10 border-teal-500/30',
  'ai-agent': 'text-pink-500 bg-pink-500/10 border-pink-500/30',
  'api-call': 'text-purple-500 bg-purple-500/10 border-purple-500/30',
  'database': 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  'notification': 'text-green-500 bg-green-500/10 border-green-500/30',
  'sleep-clinic-cpap': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'sleep-clinic-dme': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  'sleep-clinic-sleep-study': 'text-red-400 bg-red-400/10 border-red-400/30',
  'sleep-clinic-pft': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'sleep-clinic-compliance': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  'sleep-clinic-referral': 'text-amber-400 bg-amber-400/10 border-amber-400/30'
}

export function WorkflowNode({ data, selected }: NodeProps) {
  const { skin } = useSkin()
  const Icon = NODE_ICONS[data.type] || Zap
  const colorClass = NODE_COLORS[data.type] || 'text-gray-500 bg-gray-500/10 border-gray-500/30'
  
  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 transition-all min-w-[180px]",
      colorClass,
      selected && "ring-2 ring-primary ring-offset-2",
      skin === "legacy" 
        ? "bg-white shadow-lg" 
        : "aeterna-glass shadow-[0_0_20px_rgba(16,185,129,0.1)]"
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "w-3 h-3",
          skin === "legacy" ? "bg-emerald-500" : "bg-primary"
        )}
      />
      
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" />
        <div className={cn(
          "text-xs font-black tracking-tight flex-1",
          skin === "legacy" ? "text-slate-900" : "text-foreground"
        )}>
          {data.label}
        </div>
      </div>
      
      {data.description && (
        <div className={cn(
          "text-[10px] mt-1 line-clamp-2",
          skin === "legacy" ? "text-slate-500" : "text-foreground/60"
        )}>
          {data.description}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "w-3 h-3",
          skin === "legacy" ? "bg-emerald-500" : "bg-primary"
        )}
      />
    </div>
  )
}
