"use client"

import React, { useState } from "react"
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
import { toast } from "sonner"
import { Calendar } from "lucide-react"

export default function NewSleepStudyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    studyType: "level3_home" as "level3_home" | "level1_psg" | "level2_home",
    studyDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/sleep-studies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: formData.patientId,
          studyType: formData.studyType,
          studyDate: formData.studyDate,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create sleep study")
      }

      const result = await response.json()
      toast.success("Sleep study created successfully!")
      router.push(`/sleep-studies/${result.study.id}`)
    } catch (error: any) {
      console.error("Error creating sleep study:", error)
      toast.error(error.message || "Failed to create sleep study.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Create New Sleep Study</h1>

      <Card>
        <CardHeader>
          <CardTitle>Study Details</CardTitle>
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
                <Label htmlFor="studyType">Study Type</Label>
                <Select
                  value={formData.studyType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, studyType: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="studyType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level3_home">Level 3 - Home Sleep Test</SelectItem>
                    <SelectItem value="level1_psg">Level 1 - Polysomnography (PSG)</SelectItem>
                    <SelectItem value="level2_home">Level 2 - Home Sleep Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyDate">Study Date</Label>
                <Input
                  id="studyDate"
                  type="date"
                  value={formData.studyDate}
                  onChange={(e) =>
                    setFormData({ ...formData, studyDate: e.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Study"}
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
