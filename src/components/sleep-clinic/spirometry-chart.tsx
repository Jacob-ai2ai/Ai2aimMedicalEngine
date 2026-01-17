"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PFTResult } from "@/lib/medical/pft-service"
import { cn } from "@/lib/utils"

interface SpirometryChartProps {
  result: PFTResult
  className?: string
}

export function SpirometryChart({
  result,
  className,
}: SpirometryChartProps) {
  // Simple bar chart representation
  const fev1Percent = result.fev1_percent_predicted || 0
  const fvcPercent = result.fvc_percent_predicted || 0
  const ratio = result.fev1_fvc_ratio || 0

  const getBarColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return "bg-green-500"
    if (value >= threshold * 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spirometry Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* FEV1 % Predicted */}
        {result.fev1_percent_predicted != null && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">FEV1 % Predicted</span>
              <span className="text-sm font-bold">{fev1Percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={cn(
                  "h-6 rounded-full flex items-center justify-end pr-2",
                  getBarColor(fev1Percent)
                )}
                style={{ width: `${Math.min(fev1Percent, 100)}%` }}
              >
                {fev1Percent < 100 && (
                  <span className="text-xs text-white font-medium">
                    {fev1Percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>80% (Normal)</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* FVC % Predicted */}
        {result.fvc_percent_predicted != null && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">FVC % Predicted</span>
              <span className="text-sm font-bold">{fvcPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={cn(
                  "h-6 rounded-full flex items-center justify-end pr-2",
                  getBarColor(fvcPercent)
                )}
                style={{ width: `${Math.min(fvcPercent, 100)}%` }}
              >
                {fvcPercent < 100 && (
                  <span className="text-xs text-white font-medium">
                    {fvcPercent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>80% (Normal)</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* FEV1/FVC Ratio */}
        {result.fev1_fvc_ratio != null && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">FEV1/FVC Ratio</span>
              <span className="text-sm font-bold">{ratio.toFixed(3)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={cn(
                  "h-6 rounded-full flex items-center justify-end pr-2",
                  ratio >= 0.7 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min((ratio / 1.0) * 100, 100)}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {ratio.toFixed(3)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.0</span>
              <span>0.70 (Normal)</span>
              <span>1.0</span>
            </div>
          </div>
        )}

        {/* Summary Values */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          {result.fev1_liters != null && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">FEV1</p>
              <p className="text-lg font-bold">{result.fev1_liters.toFixed(2)} L</p>
            </div>
          )}
          {result.fvc_liters != null && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">FVC</p>
              <p className="text-lg font-bold">{result.fvc_liters.toFixed(2)} L</p>
            </div>
          )}
          {result.pef_liters_per_sec != null && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">PEF</p>
              <p className="text-lg font-bold">
                {result.pef_liters_per_sec.toFixed(1)} L/s
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
