"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CPAPComplianceCard } from "@/components/sleep-clinic/cpap-compliance-card"
import { NonCompliantAlert } from "@/components/sleep-clinic/non-compliant-alert"
import { DeviceDataSync } from "@/components/sleep-clinic/device-data-sync"
import type { ComplianceStatus, ComplianceReport } from "@/lib/medical/cpap-compliance-service"
import { createClientSupabase } from "@/lib/supabase/client"
import { Patient } from "@/types/database"
import { Search, AlertTriangle, Download } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function CPAPCompliancePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [nonCompliant, setNonCompliant] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNonCompliant()
  }, [])

  useEffect(() => {
    if (selectedPatientId) {
      fetchComplianceStatus()
    }
  }, [selectedPatientId])

  async function fetchComplianceStatus() {
    setLoading(true)
    try {
      const response = await fetch(`/api/cpap/compliance/${selectedPatientId}`)
      if (response.ok) {
        const data = await response.json()
        setComplianceStatus(data.status)
      }
    } catch (error) {
      console.error("Error fetching compliance:", error)
      toast.error("Failed to load compliance data")
    } finally {
      setLoading(false)
    }
  }

  async function fetchNonCompliant() {
    try {
      const response = await fetch("/api/cpap/compliance/non-compliant")
      if (response.ok) {
        const data = await response.json()
        setNonCompliant(data.nonCompliant || [])
      }
    } catch (error) {
      console.error("Error fetching non-compliant patients:", error)
    }
  }

  const handleExportReport = async (patientId: string) => {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()

      const response = await fetch(
        `/api/cpap/compliance/reports?patientId=${patientId}&startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`
      )

      if (response.ok) {
        const data = await response.json()
        // Create downloadable report
        const reportText = `CPAP Compliance Report
Patient ID: ${patientId}
Period: ${data.report.period_start} to ${data.report.period_end}
Days Used: ${data.report.compliance_data.days_used}/${data.report.compliance_data.days_required}
Average Hours/Night: ${data.report.compliance_data.average_hours_per_night}
Compliance: ${data.report.compliance_data.compliance_percentage}%
Meets Requirements: ${data.report.compliance_data.meets_insurance_requirements ? "Yes" : "No"}
`

        const blob = new Blob([reportText], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `cpap-compliance-${patientId}-${Date.now()}.txt`
        a.click()
        URL.revokeObjectURL(url)

        toast.success("Report exported successfully")
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      toast.error("Failed to export report")
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neural-glow">CPAP Compliance Monitoring</h1>
          <p className="text-muted-foreground">
            Track patient compliance with CPAP therapy requirements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Search & Compliance View */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="aeterna-glass">
            <CardHeader>
              <CardTitle>Patient Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient ID or name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={async () => {
                    // Search for patient and set selected
                    const supabase = createClientSupabase()
                    const { data } = await supabase
                      .from("patients")
                      .select("id")
                      .or(`patient_id.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
                      .limit(1)
                      .single()

                    if (data) {
                      setSelectedPatientId(data.id)
                    } else {
                      toast.error("Patient not found")
                    }
                  }}
                >
                  Search
                </Button>
              </div>

              {selectedPatientId && (
                <>
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading...</p>
                  ) : complianceStatus ? (
                    <CPAPComplianceCard
                      complianceData={complianceStatus.current_period}
                      period="Current Period (Last 30 Days)"
                    />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No compliance data available
                    </p>
                  )}

                  {complianceStatus && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleExportReport(selectedPatientId)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Non-Compliant Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Non-Compliant Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nonCompliant.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  All patients are compliant
                </p>
              ) : (
                <div className="space-y-2">
                  {nonCompliant.map((nc) => (
                    <NonCompliantAlert
                      key={nc.patient_id}
                      patientName={nc.patient?.name || "Unknown Patient"}
                      patientId={nc.patient?.patient_id || nc.patient_id}
                      complianceData={nc.compliance_data}
                      onClick={() => setSelectedPatientId(nc.patient_id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Device Data Sync */}
        <div>
          {selectedPatientId && (
            <DeviceDataSync
              patientId={selectedPatientId}
              onSyncComplete={fetchComplianceStatus}
            />
          )}
        </div>
      </div>
    </div>
  )
}
