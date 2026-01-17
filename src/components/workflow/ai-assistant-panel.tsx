/**
 * AI Assistant Panel Component
 * Chat interface for AI workflow suggestions
 */

'use client'

import React, { useState } from 'react'
import { VisualWorkflow, AIWorkflowSuggestion } from '@/types/workflow-visual'
import { WorkflowAIAssistant } from '@/lib/workflow/ai-assistant'
import { WorkflowNodeValidator } from '@/lib/workflow/node-validator'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'
import { Brain, Send, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AIAssistantPanelProps {
  workflow: VisualWorkflow
  onSuggestionApply?: (suggestion: AIWorkflowSuggestion) => void
  onIssueDetect?: (issues: Array<{ severity: string; message: string }>) => void
}

export function AIAssistantPanel({ 
  workflow, 
  onSuggestionApply,
  onIssueDetect 
}: AIAssistantPanelProps) {
  const { skin } = useSkin()
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<AIWorkflowSuggestion[]>([])
  const [issues, setIssues] = useState<Array<{
    severity: 'error' | 'warning' | 'info'
    message: string
    suggestion?: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSuggest = async () => {
    if (!input.trim()) return
    
    setIsLoading(true)
    try {
      const suggestion = await WorkflowAIAssistant.suggestWorkflowFromText(input)
      setSuggestions([suggestion, ...suggestions])
      setInput('')
    } catch (error) {
      console.error('AI suggestion error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetectIssues = async () => {
    setIsLoading(true)
    try {
      // Use validator for structural issues
      const validationIssues = WorkflowNodeValidator.validateWorkflow(workflow)
      
      // Use AI assistant for advanced issues
      const aiIssues = await WorkflowAIAssistant.detectIssues(workflow)
      
      // Combine both
      const allIssues = [...validationIssues, ...aiIssues]
      setIssues(allIssues)
      if (onIssueDetect) {
        onIssueDetect(allIssues)
      }
    } catch (error) {
      console.error('Issue detection error:', error)
      // Fallback to validator only
      const validationIssues = WorkflowNodeValidator.validateWorkflow(workflow)
      setIssues(validationIssues)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    // Auto-detect issues when workflow changes
    if (workflow.nodes.length > 0) {
      handleDetectIssues()
    }
  }, [workflow])

  return (
    <div className={cn(
      "h-full flex flex-col",
      skin === "legacy" ? "bg-white" : "bg-transparent"
    )}>
      <div className={cn(
        "p-3 border-b flex items-center gap-2",
        skin === "legacy" ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
      )}>
        <Brain className={cn("h-4 w-4", skin === "legacy" ? "text-slate-600" : "text-primary")} />
        <h3 className={cn(
          "text-xs font-black uppercase tracking-widest",
          skin === "legacy" ? "text-slate-900" : "text-foreground"
        )}>
          AI Assistant
        </h3>
      </div>

      {/* Issues Section */}
      {issues.length > 0 && (
        <div className={cn(
          "p-3 border-b space-y-2 max-h-32 overflow-y-auto",
          skin === "legacy" ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
        )}>
          {issues.map((issue, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-2 text-xs p-2 rounded",
                issue.severity === 'error' 
                  ? (skin === "legacy" ? "bg-red-50 text-red-800" : "bg-red-500/10 text-red-400")
                  : issue.severity === 'warning'
                  ? (skin === "legacy" ? "bg-yellow-50 text-yellow-800" : "bg-yellow-500/10 text-yellow-400")
                  : (skin === "legacy" ? "bg-blue-50 text-blue-800" : "bg-blue-500/10 text-blue-400")
              )}
            >
              {issue.severity === 'error' ? (
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold">{issue.message}</div>
                {issue.suggestion && (
                  <div className={cn(
                    "text-[10px] mt-1",
                    skin === "legacy" ? "opacity-70" : "opacity-60"
                  )}>
                    {issue.suggestion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {suggestions.length === 0 ? (
          <div className={cn(
            "text-center py-8 text-sm",
            skin === "legacy" ? "text-slate-500" : "text-foreground/50"
          )}>
            <Sparkles className={cn("h-8 w-8 mx-auto mb-2", skin === "legacy" ? "text-slate-400" : "text-primary/40")} />
            <div>Describe a workflow to get AI suggestions</div>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                skin === "legacy"
                  ? "bg-white border-slate-200"
                  : "aeterna-glass border-white/10"
              )}
            >
              <div className={cn(
                "text-xs font-black mb-2",
                skin === "legacy" ? "text-slate-900" : "text-foreground"
              )}>
                {suggestion.suggestion}
              </div>
              <div className={cn(
                "text-[10px] mb-2",
                skin === "legacy" ? "text-slate-600" : "text-foreground/60"
              )}>
                {suggestion.reasoning}
              </div>
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px]",
                  skin === "legacy" ? "text-slate-400" : "text-foreground/40"
                )}>
                  Confidence: {Math.round(suggestion.confidence * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px]"
                  onClick={() => onSuggestionApply?.(suggestion)}
                >
                  Apply
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className={cn(
        "p-3 border-t",
        skin === "legacy" ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
      )}>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe workflow (e.g., 'Check CPAP compliance daily and alert if below 70%')"
            className={cn(
              "text-xs min-h-[60px] resize-none",
              skin === "legacy"
                ? "bg-white border-slate-200"
                : "bg-white/5 border-white/10 text-foreground"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleSuggest()
              }
            }}
          />
          <Button
            onClick={handleSuggest}
            disabled={isLoading || !input.trim()}
            className="h-[60px] px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
