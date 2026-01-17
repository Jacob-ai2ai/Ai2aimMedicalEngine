"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ComplianceData } from "@/lib/medical/cpap-compliance-service"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface CPAPComplianceCardProps {
  complianceData: ComplianceData
  patientName?: string
  period?: string
  className?: string
}

export function CPAPComplianceCard({
  complianceData,
  patientName,
  period,
  className,
}: CPAPComplianceCardProps) {
  const meetsRequirements = complianceData.meets_insurance_requirements

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {patientName ? `${patientName}'s Compliance` : "CPAP Compliance"}
          </CardTitle>
          {meetsRequirements ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Compliant
            </Badge>
          ) : (
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Non-Compliant
            </Badge>
          )}
        </div>
        {period && (
          <p className="text-sm text-muted-foreground">{period}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Days Used</p>
            <p className="text-2xl font-bold">
              {complianceData.days_used} / {complianceData.days_required}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Hours/Night</p>
            <p className="text-2xl font-bold">
              {complianceData.average_hours_per_night.toFixed(1)}h
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Compliance Percentage</p>
            <p className="text-sm font-semibold">
              {complianceData.compliance_percentage.toFixed(1)}%
            </p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                meetsRequirements
                  ? "bg-green-500"
                  : complianceData.compliance_percentage >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{
                width: `${Math.min(complianceData.compliance_percentage, 100)}%`,
              }}
            />
          </div>
        </div>

        {!meetsRequirements && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Requirements: {complianceData.days_required} days used and 4+ hours/night
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
