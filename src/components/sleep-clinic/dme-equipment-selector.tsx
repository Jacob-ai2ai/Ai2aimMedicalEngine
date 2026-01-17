"use client"

import React, { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DMEEquipment } from "@/lib/medical/dme-service"

interface DMEEquipmentSelectorProps {
  value?: string
  onValueChange: (equipmentId: string) => void
  category?: "cpap" | "bipap" | "mask" | "supply" | "monitor"
  disabled?: boolean
}

export function DMEEquipmentSelector({
  value,
  onValueChange,
  category,
  disabled,
}: DMEEquipmentSelectorProps) {
  const [equipment, setEquipment] = useState<DMEEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchEquipment() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (category) {
          params.append("category", category)
        }
        params.append("limit", "100")

        const response = await fetch(`/api/dme/equipment?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setEquipment(data.equipment || [])
        }
      } catch (error) {
        console.error("Error fetching DME equipment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEquipment()
  }, [category])

  const filteredEquipment = equipment.filter((eq) =>
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.equipment_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <Label htmlFor="dme-equipment-selector">Equipment</Label>
      <Select onValueChange={onValueChange} value={value} disabled={disabled || loading}>
        <SelectTrigger id="dme-equipment-selector">
          <SelectValue placeholder="Select equipment" />
        </SelectTrigger>
        <SelectContent>
          <div className="p-1">
            <Input
              type="text"
              placeholder="Search equipment..."
              className="w-full px-2 py-1 rounded-md border border-input text-sm mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <SelectItem value="loading" disabled>
              Loading equipment...
            </SelectItem>
          ) : filteredEquipment.length === 0 ? (
            <SelectItem value="no-equipment" disabled>
              No equipment found
            </SelectItem>
          ) : (
            filteredEquipment.map((eq) => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.name} {eq.model ? `(${eq.model})` : ""} - {eq.equipment_code}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
