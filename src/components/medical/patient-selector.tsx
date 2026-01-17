"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientSupabase } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth?: string
  phone?: string
}

interface PatientSelectorProps {
  value?: string
  onValueChange: (patientId: string) => void
  className?: string
  required?: boolean
  disabled?: boolean
}

export function PatientSelector({
  value,
  onValueChange,
  className,
  required = false,
  disabled = false,
}: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClientSupabase()

  const loadRecentPatients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("patients")
      .select("id, patient_id, first_name, last_name, date_of_birth, phone")
      .order("created_at", { ascending: false })
      .limit(10)

    if (!error && data) {
      setPatients(data)
    }
    setLoading(false)
  }, [supabase])

  const searchPatients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("patients")
      .select("id, patient_id, first_name, last_name, date_of_birth, phone")
      .or(
        `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,patient_id.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
      )
      .limit(20)

    if (!error && data) {
      setPatients(data)
    }
    setLoading(false)
  }, [supabase, searchQuery])

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      searchPatients()
    } else if (open && searchQuery.length === 0) {
      loadRecentPatients()
    }
  }, [searchQuery, open, loadRecentPatients, searchPatients])

  const selectedPatient = patients.find((p) => p.id === value)

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        Patient {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select or search for a patient">
            {selectedPatient
              ? `${selectedPatient.first_name} ${selectedPatient.last_name} (${selectedPatient.patient_id})`
              : "Select or search for a patient"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : patients.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No patients found
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ID: {patient.patient_id}
                      {patient.phone && ` • ${patient.phone}`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
