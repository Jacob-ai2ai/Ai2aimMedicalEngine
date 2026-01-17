/**
 * Node Palette Component
 * Sidebar showing available node types for the workflow builder
 */

'use client'

import React from 'react'
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
import { WorkflowNodeType } from '@/types/workflow-visual'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'

interface NodeType {
  type: WorkflowNodeType
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: 'trigger' | 'action' | 'logic' | 'sleep-clinic'
  description: string
}

const NODE_TYPES: NodeType[] = [
  // Triggers
  {
    type: 'trigger',
    label: 'Trigger',
    icon: Zap,
    color: 'text-yellow-500',
    category: 'trigger',
    description: 'Start workflow on event or schedule'
  },
  
  // Actions
  {
    type: 'database',
    label: 'Database',
    icon: Database,
    color: 'text-blue-500',
    category: 'action',
    description: 'Query or update database'
  },
  {
    type: 'api-call',
    label: 'API Call',
    icon: Globe,
    color: 'text-purple-500',
    category: 'action',
    description: 'Call external API'
  },
  {
    type: 'notification',
    label: 'Notification',
    icon: Bell,
    color: 'text-green-500',
    category: 'action',
    description: 'Send notification'
  },
  {
    type: 'ai-agent',
    label: 'AI Agent',
    icon: Brain,
    color: 'text-pink-500',
    category: 'action',
    description: 'Invoke AI agent'
  },
  
  // Logic
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    color: 'text-orange-500',
    category: 'logic',
    description: 'Conditional branching'
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    color: 'text-gray-500',
    category: 'logic',
    description: 'Wait for specified time'
  },
  {
    type: 'loop',
    label: 'Loop',
    icon: Repeat,
    color: 'text-indigo-500',
    category: 'logic',
    description: 'Repeat actions'
  },
  {
    type: 'merge',
    label: 'Merge',
    icon: Merge,
    color: 'text-cyan-500',
    category: 'logic',
    description: 'Merge parallel branches'
  },
  {
    type: 'split',
    label: 'Split',
    icon: Split,
    color: 'text-teal-500',
    category: 'logic',
    description: 'Split into parallel branches'
  },
  
  // Sleep Clinic Specific
  {
    type: 'sleep-clinic-cpap',
    label: 'CPAP Compliance',
    icon: Moon,
    color: 'text-blue-400',
    category: 'sleep-clinic',
    description: 'Check CPAP compliance or sync data'
  },
  {
    type: 'sleep-clinic-dme',
    label: 'DME Equipment',
    icon: Activity,
    color: 'text-emerald-400',
    category: 'sleep-clinic',
    description: 'Manage DME equipment and inventory'
  },
  {
    type: 'sleep-clinic-sleep-study',
    label: 'Sleep Study',
    icon: Heart,
    color: 'text-red-400',
    category: 'sleep-clinic',
    description: 'Dispatch or manage sleep studies'
  },
  {
    type: 'sleep-clinic-pft',
    label: 'PFT Test',
    icon: CheckCircle2,
    color: 'text-purple-400',
    category: 'sleep-clinic',
    description: 'Schedule or process PFT tests'
  },
  {
    type: 'sleep-clinic-compliance',
    label: 'Compliance Check',
    icon: FileText,
    color: 'text-yellow-400',
    category: 'sleep-clinic',
    description: 'Check patient compliance'
  },
  {
    type: 'sleep-clinic-referral',
    label: 'Referral',
    icon: FileText,
    color: 'text-amber-400',
    category: 'sleep-clinic',
    description: 'Process referral forms'
  }
]

interface NodePaletteProps {
  onNodeSelect: (nodeType: WorkflowNodeType) => void
  selectedCategory?: string
}

export function NodePalette({ onNodeSelect, selectedCategory }: NodePaletteProps) {
  const { skin } = useSkin()
  const [search, setSearch] = React.useState('')
  
  const filteredNodes = NODE_TYPES.filter(node => {
    const matchesSearch = !search || 
      node.label.toLowerCase().includes(search.toLowerCase()) ||
      node.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !selectedCategory || node.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {} as Record<string, NodeType[]>)
  
  return (
    <div className={cn(
      "w-64 h-full border-r overflow-y-auto custom-scrollbar",
      skin === "legacy" 
        ? "bg-white border-slate-200" 
        : "aeterna-glass border-white/10"
    )}>
      <div className={cn(
        "p-4 border-b sticky top-0 z-10",
        skin === "legacy" ? "bg-slate-50" : "bg-white/[0.02] border-white/5"
      )}>
        <h3 className={cn(
          "text-sm font-black uppercase tracking-widest mb-3",
          skin === "legacy" ? "text-slate-900" : "text-foreground"
        )}>
          Node Palette
        </h3>
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2",
            skin === "legacy"
              ? "bg-white border-slate-200 focus:ring-emerald-500"
              : "bg-white/5 border-white/10 focus:ring-primary/50 text-foreground"
          )}
        />
      </div>
      
      <div className="p-4 space-y-6">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category}>
            <h4 className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-2",
              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
            )}>
              {category.replace('-', ' ').toUpperCase()}
            </h4>
            <div className="space-y-2">
              {nodes.map((nodeType) => {
                const Icon = nodeType.icon
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => onNodeSelect(nodeType.type)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all group",
                      "hover:scale-[1.02] hover:shadow-lg",
                      skin === "legacy"
                        ? "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                        : "aeterna-glass border-white/10 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        skin === "legacy" 
                          ? "bg-slate-100" 
                          : "bg-white/5"
                      )}>
                        <Icon className={cn("h-4 w-4", nodeType.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-xs font-black tracking-tight",
                          skin === "legacy" ? "text-slate-900" : "text-foreground"
                        )}>
                          {nodeType.label}
                        </div>
                        <div className={cn(
                          "text-[10px] mt-0.5 line-clamp-1",
                          skin === "legacy" ? "text-slate-500" : "text-foreground/50"
                        )}>
                          {nodeType.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
