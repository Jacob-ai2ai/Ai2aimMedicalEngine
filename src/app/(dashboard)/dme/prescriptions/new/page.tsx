"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PatientSelector } from "@/components/medical/patient-selector"
import { DMEEquipmentSelector } from "@/components/sleep-clinic/dme-equipment-selector"
import { toast } from "sonner"

export default function CreateDMEPrescriptionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    equipmentId: "",
    rentalOrPurchase: "rental" as "rental" | "purchase",
    durationMonths: 12,
    insuranceAuthorizationNumber: "",
    authorizationExpires: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    instructions: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.patientId) newErrors.patientId = "Please select a patient"
    if (!formData.equipmentId) newErrors.equipmentId = "Please select equipment"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/dme/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create DME prescription")
      }

      const result = await response.json()
      toast.success("DME prescription created successfully!")
      router.push(`/prescriptions/${result.prescription.id}`)
    } catch (error: any) {
      console.error("Error creating DME prescription:", error)
      toast.error(error.message || "Failed to create DME prescription.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Create DME Prescription</h1>

      <Card>
        <CardHeader>
          <CardTitle>DME Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PatientSelector
                value={formData.patientId}
                onValueChange={(id) => setFormData({ ...formData, patientId: id })}
                disabled={isSubmitting}
              />
              {errors.patientId && (
                <p className="text-red-500 text-sm">{errors.patientId}</p>
              )}

              <DMEEquipmentSelector
                value={formData.equipmentId}
                onValueChange={(id) => setFormData({ ...formData, equipmentId: id })}
                disabled={isSubmitting}
              />
              {errors.equipmentId && (
                <p className="text-red-500 text-sm">{errors.equipmentId}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="rentalOrPurchase">Rental or Purchase</Label>
                <Select
                  value={formData.rentalOrPurchase}
                  onValueChange={(value: "rental" | "purchase") =>
                    setFormData({ ...formData, rentalOrPurchase: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="rentalOrPurchase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Rental</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.rentalOrPurchase === "rental" && (
                <div className="space-y-2">
                  <Label htmlFor="durationMonths">Duration (months)</Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMonths: parseInt(e.target.value) || 12 })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="insuranceAuthorizationNumber">
                  Insurance Authorization Number
                </Label>
                <Input
                  id="insuranceAuthorizationNumber"
                  value={formData.insuranceAuthorizationNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, insuranceAuthorizationNumber: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizationExpires">Authorization Expires</Label>
                <Input
                  id="authorizationExpires"
                  type="date"
                  value={formData.authorizationExpires}
                  onChange={(e) =>
                    setFormData({ ...formData, authorizationExpires: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  rows={2}
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryAddress: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  rows={2}
                  value={formData.deliveryInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryInstructions: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create DME Prescription"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
