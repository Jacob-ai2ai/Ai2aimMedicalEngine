"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SleepStudyCard } from "@/components/sleep-clinic/sleep-study-card"
import { MonitorDispatchForm } from "@/components/sleep-clinic/monitor-dispatch-form"
import { StudyResultsViewer } from "@/components/sleep-clinic/study-results-viewer"
import { AHIChart } from "@/components/sleep-clinic/ahi-chart"
import { SleepStudy } from "@/lib/medical/sleep-study-service"
import { sleepStudyService } from "@/lib/medical/sleep-study-service"
import { createClientSupabase } from "@/lib/supabase/client"
import { Patient } from "@/types/database"

type PatientBasic = Pick<Patient, "id" | "first_name" | "last_name" | "patient_id">
import { Plus, Filter, Calendar } from "lucide-react"
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

export default function SleepStudiesPage() {
  const [studies, setStudies] = useState<SleepStudy[]>([])
  const [patients, setPatients] = useState<Record<string, PatientBasic>>({})
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedStudy, setSelectedStudy] = useState<SleepStudy | null>(null)

  useEffect(() => {
    fetchStudies()
  }, [statusFilter])

  async function fetchStudies() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter === "pending") {
        params.append("status", "pending")
      }

      const response = await fetch(`/api/sleep-studies?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStudies(data.studies || [])

        // Fetch patient details
        const patientIds = [...new Set((data.studies || []).map((s: SleepStudy) => s.patient_id))]
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
      console.error("Error fetching studies:", error)
      toast.error("Failed to load sleep studies")
    } finally {
      setLoading(false)
    }
  }

  const filteredStudies = studies.filter(
    (s) => statusFilter === "all" || s.status === statusFilter
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neural-glow">Sleep Studies</h1>
          <p className="text-muted-foreground">
            Manage Level 3 home sleep tests and polysomnography studies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="interpreted">Interpreted</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/sleep-studies/new">
              <Plus className="h-4 w-4 mr-2" />
              New Study
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Studies List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <Card className="aeterna-glass">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading studies...
              </CardContent>
            </Card>
          ) : filteredStudies.length === 0 ? (
            <Card className="aeterna-glass">
              <CardContent className="p-8 text-center text-muted-foreground">
                No studies found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredStudies.map((study) => {
                const patient = patients[study.patient_id]
                return (
                  <SleepStudyCard
                    key={study.id}
                    study={study}
                    patientName={
                      patient
                        ? `${patient.first_name} ${patient.last_name}`
                        : undefined
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedStudy(study)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Study Details Sidebar */}
        <div className="space-y-4">
          {selectedStudy && (
            <>
              {selectedStudy.status === "ordered" && (
                <MonitorDispatchForm
                  studyId={selectedStudy.id}
                  onDispatchComplete={fetchStudies}
                />
              )}

              {selectedStudy.status === "completed" && (
                <StudyResultsViewer study={selectedStudy} />
              )}

              {selectedStudy.status === "interpreted" && (
                <StudyResultsViewer study={selectedStudy} />
              )}
            </>
          )}

          {/* AHI Chart for patient's studies */}
          {selectedStudy && (
            <AHIChart
              studies={studies.filter((s) => s.patient_id === selectedStudy.patient_id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
