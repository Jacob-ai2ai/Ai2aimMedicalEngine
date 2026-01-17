"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface EquipmentStatusBadgeProps {
  status: "available" | "assigned" | "maintenance" | "retired"
  className?: string
}

export function EquipmentStatusBadge({
  status,
  className,
}: EquipmentStatusBadgeProps) {
  const statusConfig = {
    available: {
      label: "Available",
      variant: "default" as const,
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    assigned: {
      label: "Assigned",
      variant: "secondary" as const,
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    maintenance: {
      label: "Maintenance",
      variant: "outline" as const,
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    retired: {
      label: "Retired",
      variant: "destructive" as const,
      className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn("capitalize", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
