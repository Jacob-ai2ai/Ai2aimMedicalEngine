"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ClinicLocation } from "@/lib/medical/pft-service"

export default function NewPFTTestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locations, setLocations] = useState<ClinicLocation[]>([])
  const [formData, setFormData] = useState({
    patientId: "",
    testType: "spirometry" as "spirometry" | "lung_volume" | "diffusion_capacity" | "full_pft",
    testDate: new Date().toISOString().split("T")[0],
    locationId: "",
    indication: "",
    notes: "",
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      const response = await fetch("/api/pft/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/pft/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: formData.patientId,
          testType: formData.testType,
          testDate: formData.testDate,
          locationId: formData.locationId || undefined,
          indication: formData.indication || undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create PFT test")
      }

      const result = await response.json()
      toast.success("PFT test scheduled successfully!")
      router.push(`/pft/tests/${result.test.id}`)
    } catch (error: any) {
      console.error("Error creating PFT test:", error)
      toast.error(error.message || "Failed to create PFT test.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold neural-glow">Schedule New PFT Test</h1>

      <Card className="aeterna-glass">
        <CardHeader>
          <CardTitle>Test Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PatientSelector
                value={formData.patientId}
                onValueChange={(id) => setFormData({ ...formData, patientId: id })}
                disabled={isSubmitting}
              />

              <div className="space-y-2">
                <Label htmlFor="testType">Test Type</Label>
                <Select
                  value={formData.testType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, testType: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="testType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spirometry">Spirometry</SelectItem>
                    <SelectItem value="lung_volume">Lung Volume</SelectItem>
                    <SelectItem value="diffusion_capacity">Diffusion Capacity</SelectItem>
                    <SelectItem value="full_pft">Full PFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testDate">Test Date</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={formData.testDate}
                  onChange={(e) =>
                    setFormData({ ...formData, testDate: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationId">Location</Label>
                <Select
                  value={formData.locationId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, locationId: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="locationId">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} ({loc.location_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="indication">Indication</Label>
                <Input
                  id="indication"
                  placeholder="e.g., asthma, COPD, preoperative"
                  value={formData.indication}
                  onChange={(e) =>
                    setFormData({ ...formData, indication: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule Test"}
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
