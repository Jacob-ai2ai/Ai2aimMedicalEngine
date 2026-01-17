"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PFTTestCard } from "@/components/sleep-clinic/pft-test-card"
import { PFTTest } from "@/lib/medical/pft-service"
import { createClientSupabase } from "@/lib/supabase/client"
import { Patient } from "@/types/database"

type PatientBasic = Pick<Patient, "id" | "first_name" | "last_name" | "patient_id">
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PFTTestsPage() {
  const [tests, setTests] = useState<PFTTest[]>([])
  const [patients, setPatients] = useState<Record<string, PatientBasic>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchTests()
  }, [statusFilter])

  async function fetchTests() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/pft/tests?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])

        // Fetch patient details
        const patientIds = [
          ...new Set((data.tests || []).map((t: PFTTest) => t.patient_id)),
        ]
        if (patientIds.length > 0) {
          const supabase = createClientSupabase()
          const { data: patientsData } = await supabase
            .from("patients")
            .select("id, first_name, last_name, patient_id")
            .in("id", patientIds)

          if (patientsData) {
            const patientsMap: Record<string, PatientBasic> = {}
            patientsData.forEach((p) => {
              patientsMap[p.id] = p as PatientBasic
            })
            setPatients(patientsMap)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching PFT tests:", error)
      toast.error("Failed to load PFT tests")
    } finally {
      setLoading(false)
    }
  }

  const filteredTests = tests.filter(
    (t) => statusFilter === "all" || t.status === statusFilter
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neural-glow">Pulmonary Function Tests</h1>
          <p className="text-muted-foreground">
            Manage PFT tests, results, and interpretations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/pft/tests/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New PFT Test
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredTests.length === 0 ? (
        <Card className="aeterna-glass">
          <CardContent className="py-8 text-center text-muted-foreground">
            No PFT tests found
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => {
            const patient = patients[test.patient_id]
            const patientName = patient
              ? `${patient.first_name} ${patient.last_name}`
              : undefined

            return (
              <PFTTestCard
                key={test.id}
                test={test}
                patientName={patientName}
                onClick={() => {
                  window.location.href = `/pft/tests/${test.id}`
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
