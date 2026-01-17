"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientSelector } from "@/components/medical/patient-selector"
import { MedicationSelector } from "@/components/medical/medication-selector"
import { generatePrescriptionNumber } from "@/lib/medical/prescription-utils"
import { Pill, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewPrescriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    patientId: "",
    medicationId: "",
    dosage: "",
    quantity: "",
    refills: "0",
    instructions: "",
    notes: "",
    expiresAt: "",
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.patientId) {
      newErrors.patientId = "Patient is required"
    }
    if (!formData.medicationId) {
      newErrors.medicationId = "Medication is required"
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = "Dosage is required"
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0"
    }
    if (formData.refills && (parseInt(formData.refills) < 0 || parseInt(formData.refills) > 12)) {
      newErrors.refills = "Refills must be between 0 and 12"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const prescriptionNumber = generatePrescriptionNumber()
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prescriptionNumber,
          patientId: formData.patientId,
          medicationId: formData.medicationId,
          dosage: formData.dosage,
          quantity: parseInt(formData.quantity),
          refills: parseInt(formData.refills) || 0,
          instructions: formData.instructions || undefined,
          notes: formData.notes || undefined,
          expiresAt: formData.expiresAt || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create prescription")
      }

      const data = await response.json()
      router.push(`/prescriptions/${data.prescription.id}`)
    } catch (error: any) {
      setErrors({ submit: error.message || "An error occurred" })
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prescriptions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              <Pill className="h-8 w-8 text-primary" />
              New Prescription
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a new prescription for a patient
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>
              Fill in the prescription information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <PatientSelector
              value={formData.patientId}
              onValueChange={(value) => {
                setFormData({ ...formData, patientId: value })
                setErrors({ ...errors, patientId: "" })
              }}
              required
            />
            {errors.patientId && (
              <p className="text-sm text-red-500">{errors.patientId}</p>
            )}

            {/* Medication Selection */}
            <MedicationSelector
              value={formData.medicationId}
              onValueChange={(value) => {
                setFormData({ ...formData, medicationId: value })
                setErrors({ ...errors, medicationId: "" })
              }}
              required
            />
            {errors.medicationId && (
              <p className="text-sm text-red-500">{errors.medicationId}</p>
            )}

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">
                Dosage <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg twice daily"
                value={formData.dosage}
                onChange={(e) => {
                  setFormData({ ...formData, dosage: e.target.value })
                  setErrors({ ...errors, dosage: "" })
                }}
              />
              {errors.dosage && (
                <p className="text-sm text-red-500">{errors.dosage}</p>
              )}
            </div>

            {/* Quantity and Refills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="e.g., 30"
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: e.target.value })
                    setErrors({ ...errors, quantity: "" })
                  }}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refills">Refills</Label>
                <Input
                  id="refills"
                  type="number"
                  min="0"
                  max="12"
                  placeholder="0"
                  value={formData.refills}
                  onChange={(e) => {
                    setFormData({ ...formData, refills: e.target.value })
                    setErrors({ ...errors, refills: "" })
                  }}
                />
                {errors.refills && (
                  <p className="text-sm text-red-500">{errors.refills}</p>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Patient Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="e.g., Take with food, avoid alcohol"
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for pharmacy or other providers"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Prescription"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
