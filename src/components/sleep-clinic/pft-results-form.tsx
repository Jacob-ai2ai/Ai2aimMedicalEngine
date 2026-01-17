"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface PFTResultsFormProps {
  testId: string
  patientId: string
  onSuccess?: () => void
}

export function PFTResultsForm({
  testId,
  patientId,
  onSuccess,
}: PFTResultsFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Spirometry
    fev1Liters: "",
    fev1PercentPredicted: "",
    fvcLiters: "",
    fvcPercentPredicted: "",
    fev1FvcRatio: "",
    pefLitersPerSec: "",
    // Lung Volume
    tlcLiters: "",
    tlcPercentPredicted: "",
    rvLiters: "",
    rvPercentPredicted: "",
    frcLiters: "",
    frcPercentPredicted: "",
    vcLiters: "",
    vcPercentPredicted: "",
    // Diffusion
    dlco: "",
    dlcoPercentPredicted: "",
    // Patient demographics
    ageAtTest: "",
    heightCm: "",
    weightKg: "",
    gender: "",
    // Quality
    testQuality: "",
    bronchodilatorUsed: false,
    bronchodilatorType: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/pft/tests/${testId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          fev1Liters: formData.fev1Liters ? parseFloat(formData.fev1Liters) : undefined,
          fev1PercentPredicted: formData.fev1PercentPredicted
            ? parseFloat(formData.fev1PercentPredicted)
            : undefined,
          fvcLiters: formData.fvcLiters ? parseFloat(formData.fvcLiters) : undefined,
          fvcPercentPredicted: formData.fvcPercentPredicted
            ? parseFloat(formData.fvcPercentPredicted)
            : undefined,
          fev1FvcRatio: formData.fev1FvcRatio
            ? parseFloat(formData.fev1FvcRatio)
            : undefined,
          pefLitersPerSec: formData.pefLitersPerSec
            ? parseFloat(formData.pefLitersPerSec)
            : undefined,
          tlcLiters: formData.tlcLiters ? parseFloat(formData.tlcLiters) : undefined,
          tlcPercentPredicted: formData.tlcPercentPredicted
            ? parseFloat(formData.tlcPercentPredicted)
            : undefined,
          rvLiters: formData.rvLiters ? parseFloat(formData.rvLiters) : undefined,
          rvPercentPredicted: formData.rvPercentPredicted
            ? parseFloat(formData.rvPercentPredicted)
            : undefined,
          frcLiters: formData.frcLiters ? parseFloat(formData.frcLiters) : undefined,
          frcPercentPredicted: formData.frcPercentPredicted
            ? parseFloat(formData.frcPercentPredicted)
            : undefined,
          vcLiters: formData.vcLiters ? parseFloat(formData.vcLiters) : undefined,
          vcPercentPredicted: formData.vcPercentPredicted
            ? parseFloat(formData.vcPercentPredicted)
            : undefined,
          dlco: formData.dlco ? parseFloat(formData.dlco) : undefined,
          dlcoPercentPredicted: formData.dlcoPercentPredicted
            ? parseFloat(formData.dlcoPercentPredicted)
            : undefined,
          ageAtTest: formData.ageAtTest ? parseInt(formData.ageAtTest) : undefined,
          heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
          gender: formData.gender || undefined,
          testQuality: formData.testQuality || undefined,
          bronchodilatorUsed: formData.bronchodilatorUsed,
          bronchodilatorType: formData.bronchodilatorType || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save results")
      }

      toast.success("PFT results saved successfully")
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error saving PFT results:", error)
      toast.error(error.message || "Failed to save PFT results")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PFT Results</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Spirometry Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Spirometry</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fev1Liters">FEV1 (L)</Label>
                <Input
                  id="fev1Liters"
                  type="number"
                  step="0.001"
                  value={formData.fev1Liters}
                  onChange={(e) =>
                    setFormData({ ...formData, fev1Liters: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fev1PercentPredicted">FEV1 % Predicted</Label>
                <Input
                  id="fev1PercentPredicted"
                  type="number"
                  step="0.1"
                  value={formData.fev1PercentPredicted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fev1PercentPredicted: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fvcLiters">FVC (L)</Label>
                <Input
                  id="fvcLiters"
                  type="number"
                  step="0.001"
                  value={formData.fvcLiters}
                  onChange={(e) =>
                    setFormData({ ...formData, fvcLiters: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fvcPercentPredicted">FVC % Predicted</Label>
                <Input
                  id="fvcPercentPredicted"
                  type="number"
                  step="0.1"
                  value={formData.fvcPercentPredicted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fvcPercentPredicted: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="fev1FvcRatio">FEV1/FVC Ratio</Label>
                <Input
                  id="fev1FvcRatio"
                  type="number"
                  step="0.001"
                  value={formData.fev1FvcRatio}
                  onChange={(e) =>
                    setFormData({ ...formData, fev1FvcRatio: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="pefLitersPerSec">PEF (L/s)</Label>
                <Input
                  id="pefLitersPerSec"
                  type="number"
                  step="0.1"
                  value={formData.pefLitersPerSec}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pefLitersPerSec: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Lung Volume Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lung Volume</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tlcLiters">TLC (L)</Label>
                <Input
                  id="tlcLiters"
                  type="number"
                  step="0.001"
                  value={formData.tlcLiters}
                  onChange={(e) =>
                    setFormData({ ...formData, tlcLiters: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tlcPercentPredicted">TLC % Predicted</Label>
                <Input
                  id="tlcPercentPredicted"
                  type="number"
                  step="0.1"
                  value={formData.tlcPercentPredicted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tlcPercentPredicted: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Demographics (at test time)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ageAtTest">Age</Label>
                <Input
                  id="ageAtTest"
                  type="number"
                  value={formData.ageAtTest}
                  onChange={(e) =>
                    setFormData({ ...formData, ageAtTest: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  step="0.1"
                  value={formData.heightCm}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  value={formData.weightKg}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="testQuality">Test Quality</Label>
                <Select
                  value={formData.testQuality}
                  onValueChange={(value) =>
                    setFormData({ ...formData, testQuality: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="acceptable">Acceptable</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Results
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
