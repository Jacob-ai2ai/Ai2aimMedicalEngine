"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SleepStudy } from "@/lib/medical/sleep-study-service"

interface AHIChartProps {
  studies: SleepStudy[]
  className?: string
}

export function AHIChart({ studies, className }: AHIChartProps) {
  const studiesWithAHI = studies
    .filter((s) => s.results && (s.results as any).ahi !== undefined)
    .map((s) => ({
      date: s.study_date || s.created_at,
      ahi: (s.results as any).ahi as number,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (studiesWithAHI.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          No AHI data available
        </CardContent>
      </Card>
    )
  }

  const maxAHI = Math.max(...studiesWithAHI.map((s) => s.ahi), 30)
  const chartHeight = 200

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>AHI Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className="relative"
            style={{ height: `${chartHeight}px` }}
          >
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pr-2">
              <span>{maxAHI}</span>
              <span>{Math.floor(maxAHI / 2)}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 0.5, 1].map((pos) => (
                  <div
                    key={pos}
                    className="border-t border-muted"
                    style={{ marginTop: pos === 0 ? "0" : pos === 0.5 ? "auto" : "0" }}
                  />
                ))}
              </div>

              {/* AHI bars */}
              <div className="absolute inset-0 flex items-end gap-2">
                {studiesWithAHI.map((study, index) => {
                  const height = (study.ahi / maxAHI) * 100
                  const severity =
                    study.ahi < 5
                      ? "bg-green-500"
                      : study.ahi < 15
                      ? "bg-yellow-500"
                      : study.ahi < 30
                      ? "bg-orange-500"
                      : "bg-red-500"

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div
                        className={severity + " w-full rounded-t transition-all group-hover:opacity-80"}
                        style={{ height: `${height}%` }}
                        title={`AHI: ${study.ahi} on ${new Date(study.date).toLocaleDateString()}`}
                      />
                      <div className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(study.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Normal (&lt;5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Mild (5-14)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span>Moderate (15-29)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Severe (≥30)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
