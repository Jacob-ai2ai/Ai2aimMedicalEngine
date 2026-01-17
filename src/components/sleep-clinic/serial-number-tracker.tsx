"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EquipmentStatusBadge } from "./equipment-status-badge"
import { DMEInventoryItem } from "@/lib/medical/dme-service"
import { Search, Package } from "lucide-react"
import { toast } from "sonner"

export function SerialNumberTracker() {
  const [serialNumber, setSerialNumber] = useState("")
  const [equipment, setEquipment] = useState<DMEInventoryItem | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!serialNumber.trim()) {
      toast.error("Please enter a serial number")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/dme/inventory?serialNumber=${encodeURIComponent(serialNumber)}`
      )

      if (!response.ok) {
        throw new Error("Equipment not found")
      }

      const data = await response.json()
      setEquipment(data.inventory)
    } catch (error: any) {
      console.error("Error searching equipment:", error)
      toast.error(error.message || "Equipment not found")
      setEquipment(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Serial Number Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter serial number..."
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {equipment && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {equipment.equipment?.name || "Unknown Equipment"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Serial: {equipment.serial_number}
                  </p>
                </div>
              </div>
              <EquipmentStatusBadge status={equipment.status as any} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Model</Label>
                <p className="font-medium">
                  {equipment.equipment?.model || "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{equipment.location || "N/A"}</p>
              </div>
              {equipment.assigned_to_patient_id && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="font-medium">
                    Patient ID: {equipment.assigned_to_patient_id}
                  </p>
                </div>
              )}
              {equipment.warranty_expires && (
                <div>
                  <Label className="text-muted-foreground">Warranty Expires</Label>
                  <p className="font-medium">
                    {new Date(equipment.warranty_expires).toLocaleDateString()}
                  </p>
                </div>
              )}
              {equipment.next_maintenance_date && (
                <div>
                  <Label className="text-muted-foreground">Next Maintenance</Label>
                  <p className="font-medium">
                    {new Date(equipment.next_maintenance_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
