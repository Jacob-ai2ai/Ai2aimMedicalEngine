"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { Sparkles } from "lucide-react"
import { useSkin } from "@/components/theme/skin-provider"

interface CognitiveCardProps extends React.ComponentProps<typeof Card> {
  suggestion?: string
  isUrgent?: boolean
  aiReasoning?: string
}

export const CognitiveCard: React.FC<CognitiveCardProps> = ({
  children,
  className,
  suggestion,
  isUrgent,
  aiReasoning,
  ...props
}) => {
  const { skin } = useSkin()

  return (
    <Card
      className={cn(
        "transition-all duration-500 group relative overflow-hidden rounded-[1.5rem]",
        skin === "legacy"
          ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50"
          : "aeterna-glass border-white/5",
        !isUrgent && (skin === "legacy" ? "hover:border-primary/20" : "hover:border-primary/30"),
        isUrgent && (skin === "legacy" ? "border-red-200 bg-red-50/30" : "border-red-500/30"),
        className
      )}
      {...props}
    >
      {/* Background Neural Pulse */}
      <div className={cn(
        "absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all duration-700",
        skin === "legacy" ? "bg-emerald-500/5" : "bg-primary/5"
      )} />
      
      {/* AI Suggestion Header */}
      {suggestion && (
        <div className={cn(
          "px-6 py-3 border-b flex items-center gap-3",
          skin === "legacy" ? "border-slate-50 bg-slate-50/50" : "border-white/5",
          isUrgent ? (skin === "legacy" ? "bg-red-50" : "bg-red-500/5") : ""
        )}>
          <Sparkles className={cn("h-4 w-4", isUrgent ? "text-red-500" : "text-emerald-500")} />
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            skin === "legacy" ? "text-slate-500" : "text-foreground/80"
          )}>
            Cognitive Insight
          </span>
          <span className={cn(
            "ml-auto text-[10px] font-bold uppercase",
            isUrgent ? "text-red-600" : "text-emerald-600"
          )}>
            {suggestion}
          </span>
        </div>
      )}

      {children}

      {/* Ambient Reasoning Tooltip */}
      {aiReasoning && (
        <div className="p-6 pt-0">
          <div className={cn(
            "p-4 rounded-2xl mt-2 border",
            skin === "legacy" 
              ? "bg-slate-50 border-slate-100" 
              : "bg-white/[0.02] border-white/5"
          )}>
            <p className={cn(
              "text-[11px] leading-relaxed italic font-medium",
              skin === "legacy" ? "text-slate-400" : "text-foreground/40"
            )}>
              AI Reasoning: {aiReasoning}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
