"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PFTInterpretation } from "@/lib/medical/pft-service"
import { cn } from "@/lib/utils"
import { FileText, Calendar, User } from "lucide-react"

interface PFTInterpretationViewerProps {
  interpretation: PFTInterpretation
  className?: string
}

export function PFTInterpretationViewer({
  interpretation,
  className,
}: PFTInterpretationViewerProps) {
  const patternLabels = {
    normal: "Normal",
    obstructive: "Obstructive",
    restrictive: "Restrictive",
    mixed: "Mixed",
    airway_obstruction: "Airway Obstruction",
  }

  const severityLabels = {
    mild: "Mild",
    moderate: "Moderate",
    moderate_severe: "Moderate-Severe",
    severe: "Severe",
  }

  const patternColors = {
    normal: "bg-green-100 text-green-800",
    obstructive: "bg-orange-100 text-orange-800",
    restrictive: "bg-blue-100 text-blue-800",
    mixed: "bg-purple-100 text-purple-800",
    airway_obstruction: "bg-red-100 text-red-800",
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PFT Interpretation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {interpretation.overall_pattern && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pattern</p>
              <Badge
                className={cn(
                  patternColors[
                    interpretation.overall_pattern as keyof typeof patternColors
                  ] || "bg-gray-100 text-gray-800"
                )}
              >
                {patternLabels[
                  interpretation.overall_pattern as keyof typeof patternLabels
                ] || interpretation.overall_pattern}
              </Badge>
            </div>
          )}
          {interpretation.severity && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Severity</p>
              <Badge variant="outline">
                {severityLabels[
                  interpretation.severity as keyof typeof severityLabels
                ] || interpretation.severity}
              </Badge>
            </div>
          )}
          {interpretation.interpretation_date && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Interpreted Date
              </p>
              <p className="font-medium">
                {new Date(
                  interpretation.interpretation_date
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {interpretation.diagnosis && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
            <p className="font-medium">{interpretation.diagnosis}</p>
          </div>
        )}

        {interpretation.recommendations && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Recommendations
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {interpretation.recommendations}
            </p>
          </div>
        )}

        {interpretation.follow_up_required && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-800">
              Follow-up Required
            </p>
            {interpretation.follow_up_date && (
              <p className="text-sm text-yellow-700 mt-1">
                Follow-up Date:{" "}
                {new Date(interpretation.follow_up_date).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {interpretation.notes && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{interpretation.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
