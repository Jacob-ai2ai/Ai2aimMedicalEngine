"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PatientSelector } from "@/components/medical/patient-selector"
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClientSupabase } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  full_name?: string
}

export default function NewCommunicationPage() {
  const router = useRouter()
  const supabase = createClientSupabase()
  const [loading, setLoading] = useState(false)
  const [encoding, setEncoding] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    communicationType: "",
    direction: "",
    subject: "",
    content: "",
    patientId: "",
    toUserId: "",
    relatedPrescriptionId: "",
  })

  // Load users for recipient selection
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("id, email, full_name")
        .limit(100)
      if (data) {
        setUsers(data)
      }
    }
    loadUsers()
  }, [supabase])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.communicationType) {
      newErrors.communicationType = "Communication type is required"
    }
    if (!formData.direction) {
      newErrors.direction = "Direction is required"
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required"
    }
    if (formData.direction === "outbound" && !formData.toUserId) {
      newErrors.toUserId = "Recipient is required for outbound communications"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEncode = async () => {
    if (!formData.content.trim()) {
      setErrors({ content: "Content is required for encoding" })
      return
    }

    setEncoding(true)
    try {
      const response = await fetch("/api/communications/encode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: formData.content,
          communicationType: formData.communicationType || "letter",
        }),
      })

      if (!response.ok) {
        throw new Error("Encoding failed")
      }

      const data = await response.json()
      // Update form with extracted data
      if (data.extracted) {
        if (data.extracted.subject) {
          setFormData({ ...formData, subject: data.extracted.subject })
        }
        if (data.extracted.patientId) {
          setFormData({ ...formData, patientId: data.extracted.patientId })
        }
        if (data.extracted.communicationType) {
          setFormData({
            ...formData,
            communicationType: data.extracted.communicationType,
          })
        }
      }
    } catch (error) {
      setErrors({ encode: "Failed to encode communication" })
    } finally {
      setEncoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/communications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communicationType: formData.communicationType,
          direction: formData.direction,
          subject: formData.subject || undefined,
          content: formData.content,
          patientId: formData.patientId || undefined,
          toUserId: formData.direction === "outbound" ? formData.toUserId : undefined,
          relatedPrescriptionId: formData.relatedPrescriptionId || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create communication")
      }

      const data = await response.json()
      router.push(`/communications/${data.communication.id}`)
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
            <Link href="/communications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              <Mail className="h-8 w-8 text-primary" />
              New Communication
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a new letter, referral, message, or notification
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Communication Details</CardTitle>
            <CardDescription>
              Fill in the communication information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type and Direction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="communicationType">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.communicationType}
                  onValueChange={(value) => {
                    setFormData({ ...formData, communicationType: value })
                    setErrors({ ...errors, communicationType: "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
                {errors.communicationType && (
                  <p className="text-sm text-red-500">{errors.communicationType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction">
                  Direction <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.direction}
                  onValueChange={(value) => {
                    setFormData({ ...formData, direction: value, toUserId: "" })
                    setErrors({ ...errors, direction: "", toUserId: "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
                {errors.direction && (
                  <p className="text-sm text-red-500">{errors.direction}</p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Communication subject line"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">
                  Content <span className="text-red-500">*</span>
                </Label>
                {formData.communicationType && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEncode}
                    disabled={encoding || !formData.content.trim()}
                  >
                    {encoding ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Encoding...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-3 w-3" />
                        Auto-Encode
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                placeholder="Enter communication content..."
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value })
                  setErrors({ ...errors, content: "" })
                }}
                rows={8}
                required
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
              {errors.encode && (
                <p className="text-sm text-yellow-600">{errors.encode}</p>
              )}
            </div>

            {/* Patient Selection */}
            <PatientSelector
              value={formData.patientId}
              onValueChange={(value) =>
                setFormData({ ...formData, patientId: value })
              }
            />

            {/* Recipient Selection (for outbound) */}
            {formData.direction === "outbound" && (
              <div className="space-y-2">
                <Label htmlFor="toUserId">
                  Recipient <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.toUserId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, toUserId: value })
                    setErrors({ ...errors, toUserId: "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.toUserId && (
                  <p className="text-sm text-red-500">{errors.toUserId}</p>
                )}
              </div>
            )}

            {/* Related Prescription (optional) */}
            <div className="space-y-2">
              <Label htmlFor="relatedPrescriptionId">Related Prescription (Optional)</Label>
              <Input
                id="relatedPrescriptionId"
                placeholder="Prescription ID"
                value={formData.relatedPrescriptionId}
                onChange={(e) =>
                  setFormData({ ...formData, relatedPrescriptionId: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Link this communication to a specific prescription
              </p>
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
                  "Create Communication"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
