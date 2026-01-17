"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SleepStudy } from "@/lib/medical/sleep-study-service"

interface StudyResultsViewerProps {
  study: SleepStudy
  className?: string
}

export function StudyResultsViewer({
  study,
  className,
}: StudyResultsViewerProps) {
  if (!study.results) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          No results available yet
        </CardContent>
      </Card>
    )
  }

  const results = study.results as any

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Study Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.ahi !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">AHI (Apnea-Hypopnea Index)</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{results.ahi}</p>
              <Badge
                variant={
                  results.ahi < 5
                    ? "success"
                    : results.ahi < 15
                    ? "warning"
                    : "destructive"
                }
              >
                {results.ahi < 5
                  ? "Normal"
                  : results.ahi < 15
                  ? "Mild"
                  : results.ahi < 30
                  ? "Moderate"
                  : "Severe"}
              </Badge>
            </div>
          </div>
        )}

        {results.rdi !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">RDI (Respiratory Disturbance Index)</p>
            <p className="text-2xl font-bold">{results.rdi}</p>
          </div>
        )}

        {results.oxygen_saturation && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Oxygen Saturation</p>
            <p className="text-2xl font-bold">
              {results.oxygen_saturation.min}% - {results.oxygen_saturation.max}%
            </p>
            <p className="text-sm text-muted-foreground">
              Average: {results.oxygen_saturation.average}%
            </p>
          </div>
        )}

        {results.sleep_efficiency && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Sleep Efficiency</p>
            <p className="text-2xl font-bold">{results.sleep_efficiency}%</p>
          </div>
        )}

        {study.diagnosis && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
            <p className="font-medium">{study.diagnosis}</p>
          </div>
        )}

        {study.recommendations && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-1">Recommendations</p>
            <p className="text-sm">{study.recommendations}</p>
          </div>
        )}

        {study.interpreted_by && (
          <div className="pt-2 text-xs text-muted-foreground">
            Interpreted on {study.interpretation_date && new Date(study.interpretation_date).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
