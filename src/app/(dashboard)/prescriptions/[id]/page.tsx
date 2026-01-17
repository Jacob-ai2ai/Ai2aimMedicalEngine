"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { notFound } from "next/navigation"
import { 
  CheckCircle2, 
  XCircle, 
  Package, 
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function PrescriptionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const supabase = createClientSupabase()
  const [prescription, setPrescription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [verifyReason, setVerifyReason] = useState("")
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verifyApproved, setVerifyApproved] = useState<boolean | null>(null)

  const fetchPrescription = useCallback(async () => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        patients:patient_id (
          id,
          first_name,
          last_name,
          patient_id,
          date_of_birth,
          phone,
          email
        ),
        medications:medication_id (
          name,
          generic_name,
          dosage_form,
          strength
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !data) {
      setLoading(false)
      return
    }

    setPrescription(data)
    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    fetchPrescription()
  }, [fetchPrescription])

  const handleVerify = async (approved: boolean) => {
    if (!prescription) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/prescriptions/${params.id}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved,
          reason: verifyReason || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to verify prescription")
      }

      await fetchPrescription()
      setShowVerifyDialog(false)
      setVerifyReason("")
    } catch (error: any) {
      alert(error.message || "An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  const handleFill = async () => {
    if (!prescription) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/prescriptions/${params.id}/fill`, {
        method: "PATCH",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to fill prescription")
      }

      await fetchPrescription()
    } catch (error: any) {
      alert(error.message || "An error occurred")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!prescription) {
    notFound()
  }

  const canVerify = prescription.status === "pending"
  const canFill = prescription.status === "approved"
  const isPharmacist = true // This should come from user profile

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prescriptions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Prescription Details</h1>
            <p className="text-muted-foreground">RX #{prescription.prescription_number}</p>
          </div>
        </div>
      </div>

      {/* Status Badge and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Status</p>
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold",
                  prescription.status === "pending" && "bg-yellow-100 text-yellow-800",
                  prescription.status === "approved" && "bg-blue-100 text-blue-800",
                  prescription.status === "rejected" && "bg-red-100 text-red-800",
                  prescription.status === "filled" && "bg-green-100 text-green-800",
                  prescription.status === "dispensed" && "bg-purple-100 text-purple-800",
                )}>
                  {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {canVerify && isPharmacist && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerifyApproved(false)
                      setShowVerifyDialog(true)
                    }}
                    disabled={actionLoading}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setVerifyApproved(true)
                      setShowVerifyDialog(true)
                    }}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {canFill && isPharmacist && (
                <Button
                  onClick={handleFill}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Filling...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Fill Prescription
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verify Dialog */}
      {showVerifyDialog && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>
              {verifyApproved ? "Approve" : "Reject"} Prescription
            </CardTitle>
            <CardDescription>
              {verifyApproved 
                ? "Confirm approval of this prescription"
                : "Please provide a reason for rejection"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!verifyApproved && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Rejection</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  value={verifyReason}
                  onChange={(e) => setVerifyReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerifyDialog(false)
                  setVerifyReason("")
                  setVerifyApproved(null)
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleVerify(verifyApproved === true)}
                disabled={actionLoading || (!verifyApproved && !verifyReason.trim())}
                variant={verifyApproved ? "default" : "destructive"}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {verifyApproved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm Rejection
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Medication</p>
              <p className="text-sm text-muted-foreground">
                {prescription.medications?.name} ({prescription.dosage})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Quantity</p>
              <p className="text-sm text-muted-foreground">
                {prescription.quantity} {prescription.medications?.dosage_form}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Refills</p>
              <p className="text-sm text-muted-foreground">{prescription.refills}</p>
            </div>
            {prescription.instructions && (
              <div>
                <p className="text-sm font-medium">Instructions</p>
                <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
              </div>
            )}
            {prescription.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{prescription.notes}</p>
              </div>
            )}
            {prescription.expires_at && (
              <div>
                <p className="text-sm font-medium">Expires</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(prescription.expires_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {prescription.patients?.first_name} {prescription.patients?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Patient ID</p>
              <p className="text-sm text-muted-foreground">{prescription.patients?.patient_id}</p>
            </div>
            {prescription.patients?.date_of_birth && (
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(prescription.patients.date_of_birth).toLocaleDateString()}
                </p>
              </div>
            )}
            {prescription.patients?.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{prescription.patients.phone}</p>
              </div>
            )}
            {prescription.patients?.email && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{prescription.patients.email}</p>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/patients/${prescription.patients?.id}`}>View Patient</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
