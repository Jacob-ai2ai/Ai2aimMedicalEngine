"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PatientSelector } from "@/components/medical/patient-selector"
import { EquipmentStatusBadge } from "./equipment-status-badge"
import { DMEInventoryItem } from "@/lib/medical/dme-service"
import { toast } from "sonner"
import { UserPlus, X } from "lucide-react"

interface EquipmentAssignmentCardProps {
  equipment: DMEInventoryItem
  onAssignmentChange?: () => void
}

export function EquipmentAssignmentCard({
  equipment,
  onAssignmentChange,
}: EquipmentAssignmentCardProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [patientId, setPatientId] = useState<string>("")

  const handleAssign = async () => {
    if (!patientId) {
      toast.error("Please select a patient")
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/dme/inventory/${equipment.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to assign equipment")
      }

      toast.success("Equipment assigned successfully")
      setPatientId("")
      onAssignmentChange?.()
    } catch (error: any) {
      console.error("Error assigning equipment:", error)
      toast.error(error.message || "Failed to assign equipment")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleReturn = async () => {
    setIsAssigning(true)
    try {
      const response = await fetch(`/api/dme/inventory/${equipment.id}/return`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to return equipment")
      }

      toast.success("Equipment returned successfully")
      onAssignmentChange?.()
    } catch (error: any) {
      console.error("Error returning equipment:", error)
      toast.error(error.message || "Failed to return equipment")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {equipment.equipment?.name || "Unknown Equipment"}
          </CardTitle>
          <EquipmentStatusBadge status={equipment.status as any} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Serial Number</Label>
            <p className="font-medium">{equipment.serial_number || "N/A"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Location</Label>
            <p className="font-medium">{equipment.location || "N/A"}</p>
          </div>
          {equipment.assigned_to_patient_id && (
            <div className="col-span-2">
              <Label className="text-muted-foreground">Assigned To</Label>
              <p className="font-medium">Patient ID: {equipment.assigned_to_patient_id}</p>
            </div>
          )}
        </div>

        {equipment.status === "available" && (
          <div className="space-y-2 pt-4 border-t">
            <PatientSelector
              value={patientId}
              onValueChange={setPatientId}
              disabled={isAssigning}
            />
            <Button
              onClick={handleAssign}
              disabled={isAssigning || !patientId}
              className="w-full"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign to Patient
            </Button>
          </div>
        )}

        {equipment.status === "assigned" && (
          <Button
            onClick={handleReturn}
            disabled={isAssigning}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Return Equipment
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
