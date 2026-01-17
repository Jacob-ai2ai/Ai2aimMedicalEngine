"use client"

import React, { useState, useEffect } from "react"
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
import { Monitor } from "@/lib/medical/sleep-study-service"
import { toast } from "sonner"
import { Package, Send } from "lucide-react"

interface MonitorDispatchFormProps {
  studyId: string
  onDispatchComplete?: () => void
}

export function MonitorDispatchForm({
  studyId,
  onDispatchComplete,
}: MonitorDispatchFormProps) {
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [selectedMonitor, setSelectedMonitor] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [dispatching, setDispatching] = useState(false)

  useEffect(() => {
    async function fetchMonitors() {
      setLoading(true)
      try {
        const response = await fetch("/api/sleep-studies/monitors")
        if (response.ok) {
          const data = await response.json()
          setMonitors(data.monitors || [])
        } else {
          throw new Error("Failed to fetch monitors")
        }
      } catch (error) {
        console.error("Error fetching monitors:", error)
        toast.error("Failed to load available monitors")
      } finally {
        setLoading(false)
      }
    }

    fetchMonitors()
  }, [])

  const handleDispatch = async () => {
    if (!selectedMonitor) {
      toast.error("Please select a monitor")
      return
    }

    setDispatching(true)
    try {
      const response = await fetch(`/api/sleep-studies/${studyId}/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monitorSerial: selectedMonitor,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to dispatch monitor")
      }

      toast.success("Monitor dispatched successfully")
      onDispatchComplete?.()
    } catch (error: any) {
      console.error("Error dispatching monitor:", error)
      toast.error(error.message || "Failed to dispatch monitor")
    } finally {
      setDispatching(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Dispatch Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Available Monitors</Label>
          <Select
            value={selectedMonitor}
            onValueChange={setSelectedMonitor}
            disabled={loading || dispatching}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a monitor" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Loading monitors...
                </SelectItem>
              ) : monitors.length === 0 ? (
                <SelectItem value="no-monitors" disabled>
                  No available monitors
                </SelectItem>
              ) : (
                monitors.map((monitor) => (
                  <SelectItem key={monitor.id} value={monitor.serial_number}>
                    {monitor.equipment?.name || "Unknown"} - {monitor.serial_number}
                    {monitor.equipment?.model && ` (${monitor.equipment.model})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {monitors.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            No monitors available. Please add monitors to inventory first.
          </p>
        )}

        <Button
          onClick={handleDispatch}
          disabled={loading || dispatching || !selectedMonitor}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {dispatching ? "Dispatching..." : "Dispatch Monitor"}
        </Button>
      </CardContent>
    </Card>
  )
}
