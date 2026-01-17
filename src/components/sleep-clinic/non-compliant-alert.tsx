"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ComplianceData } from "@/lib/medical/cpap-compliance-service"

interface NonCompliantAlertProps {
  patientName: string
  patientId: string
  complianceData: ComplianceData
  className?: string
  onClick?: () => void
}

export function NonCompliantAlert({
  patientName,
  patientId,
  complianceData,
  className,
  onClick,
}: NonCompliantAlertProps) {
  return (
    <Card
      className={cn(
        "border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-colors cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{patientName}</p>
            <p className="text-sm text-muted-foreground">ID: {patientId}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-orange-500">
                {complianceData.days_used}/{complianceData.days_required} days
              </span>
              <span className="text-orange-500">
                {complianceData.average_hours_per_night.toFixed(1)}h/night
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
