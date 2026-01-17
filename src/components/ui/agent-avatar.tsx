"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AgentAvatarProps {
  id: string
  name: string
  role: string
  status: "idle" | "analyzing" | "alert"
  imageUrl?: string
  className?: string
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  id,
  name,
  role,
  status,
  imageUrl,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center group cursor-pointer transition-all duration-500",
        className
      )}
    >
      {/* Dynamic Glow Ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700",
          status === "idle" && "bg-primary/20",
          status === "analyzing" && "bg-secondary/40 animate-pulse",
          status === "alert" && "bg-red-500/40 animate-ping"
        )}
      />

      {/* Avatar Container */}
      <div
        className={cn(
          "w-12 h-12 rounded-full border-2 p-0.5 z-10 transition-colors duration-500",
          status === "idle" && "border-primary/40 bg-primary/5",
          status === "analyzing" && "border-secondary bg-secondary/10",
          status === "alert" && "border-red-500 bg-red-500/10"
        )}
      >
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name} 
            width={48}
            height={48}
            className="w-full h-full rounded-full object-cover" 
          />
        ) : (
          <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground/70">
            {name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Role Indicator Dot */}
      <div
        className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background z-20",
          status === "idle" && "bg-primary",
          status === "analyzing" && "bg-secondary",
          status === "alert" && "bg-red-500"
        )}
      />

      {/* Tooltip (Cinematic) */}
      <div className="absolute left-14 top-1 py-1 px-3 rounded-md aeterna-glass opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-50 min-w-[120px]">
        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{role}</p>
        <p className="text-xs font-medium text-foreground">{name}</p>
        <div className="mt-1 h-[1px] w-full bg-foreground/10" />
        <p className="text-[9px] text-foreground/50 italic mt-0.5 capitalize">{status}...</p>
      </div>
    </div>
  )
}
