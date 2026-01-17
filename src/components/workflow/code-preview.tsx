/**
 * Code Preview Component
 * Shows generated TypeScript code from visual workflow
 */

'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-sm text-muted-foreground">Loading editor...</div>
    </div>
  )
})
import { VisualWorkflow } from '@/types/workflow-visual'
import { WorkflowCodeGenerator } from '@/lib/workflow/code-generator'
import { cn } from '@/lib/utils'
import { useSkin } from '@/components/theme/skin-provider'
import { Copy, Check } from 'lucide-react'

interface CodePreviewProps {
  workflow: VisualWorkflow
  onCodeChange?: (code: string) => void
}

export function CodePreview({ workflow, onCodeChange }: CodePreviewProps) {
  const { skin } = useSkin()
  const [codePreview, setCodePreview] = useState<{ code: string; language: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const generated = WorkflowCodeGenerator.generateCode(workflow)
      setCodePreview({
        code: generated.code,
        language: generated.language
      })
      if (onCodeChange) {
        onCodeChange(generated.code)
      }
    } catch (error) {
      setCodePreview({
        code: `// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`,
        language: 'typescript'
      })
    }
  }, [workflow, onCodeChange])

  const handleCopy = async () => {
    if (codePreview) {
      await navigator.clipboard.writeText(codePreview.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
          Generated Code
        </h3>
        <button
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            skin === "legacy"
              ? "hover:bg-slate-100 text-slate-600"
              : "hover:bg-white/10 text-foreground/60"
          )}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={codePreview?.language || 'typescript'}
          value={codePreview?.code || '// No code generated yet'}
          theme={skin === 'legacy' ? 'vs-light' : 'vs-dark'}
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 12,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </div>
    </div>
  )
}
