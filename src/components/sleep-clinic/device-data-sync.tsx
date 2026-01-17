"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RefreshCw, Cloud } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DeviceDataSyncProps {
  patientId: string
  onSyncComplete?: () => void
}

export function DeviceDataSync({
  patientId,
  onSyncComplete,
}: DeviceDataSyncProps) {
  const [dataSource, setDataSource] = useState<"resmed_cloud" | "philips_care" | "manual">("manual")
  const [isSyncing, setIsSyncing] = useState(false)
  const [manualData, setManualData] = useState("")

  const handleSync = async () => {
    if (dataSource === "manual" && !manualData.trim()) {
      toast.error("Please enter compliance data")
      return
    }

    setIsSyncing(true)
    try {
      let data: any

      if (dataSource === "manual") {
        try {
          data = JSON.parse(manualData)
        } catch {
          toast.error("Invalid JSON format")
          setIsSyncing(false)
          return
        }
      } else {
        // For API sources, you would fetch from the external API here
        // For now, we'll use a placeholder
        data = {
          period_start: new Date().toISOString().split("T")[0],
          period_end: new Date().toISOString().split("T")[0],
          daily_usage: [],
        }
      }

      const response = await fetch(`/api/cpap/compliance/${patientId}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataSource,
          data,
          periodStart: data.period_start || new Date().toISOString().split("T")[0],
          periodEnd: data.period_end || new Date().toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sync data")
      }

      toast.success("Compliance data synced successfully")
      setManualData("")
      onSyncComplete?.()
    } catch (error: any) {
      console.error("Error syncing data:", error)
      toast.error(error.message || "Failed to sync compliance data")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Device Data Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select
            value={dataSource}
            onValueChange={(value: any) => setDataSource(value)}
            disabled={isSyncing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resmed_cloud">ResMed Cloud</SelectItem>
              <SelectItem value="philips_care">Philips Care</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dataSource === "manual" && (
          <div className="space-y-2">
            <Label>Compliance Data (JSON)</Label>
            <textarea
              className="w-full min-h-[200px] px-3 py-2 text-sm border rounded-md font-mono"
              value={manualData}
              onChange={(e) => setManualData(e.target.value)}
              placeholder='{"period_start": "2026-01-01", "period_end": "2026-01-31", "daily_usage": [{"date": "2026-01-01", "hours": 6.5, "used": true}]}'
              disabled={isSyncing}
            />
          </div>
        )}

        {dataSource !== "manual" && (
          <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
            {dataSource === "resmed_cloud" && (
              <p>Connect to ResMed Cloud API to automatically sync compliance data.</p>
            )}
            {dataSource === "philips_care" && (
              <p>Connect to Philips Care Orchestrator API to automatically sync compliance data.</p>
            )}
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing..." : "Sync Data"}
        </Button>
      </CardContent>
    </Card>
  )
}
