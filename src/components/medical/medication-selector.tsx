"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientSupabase } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Medication {
  id: string
  name: string
  generic_name?: string
  dosage_form?: string
  strength?: string
  ndc_code?: string
}

interface MedicationSelectorProps {
  value?: string
  onValueChange: (medicationId: string) => void
  className?: string
  required?: boolean
}

export function MedicationSelector({
  value,
  onValueChange,
  className,
  required = false,
}: MedicationSelectorProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClientSupabase()

  const loadRecentMedications = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("medications")
      .select("id, name, generic_name, dosage_form, strength, ndc_code")
      .order("created_at", { ascending: false })
      .limit(10)

    if (!error && data) {
      setMedications(data)
    }
    setLoading(false)
  }, [supabase])

  const searchMedications = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("medications")
      .select("id, name, generic_name, dosage_form, strength, ndc_code")
      .or(
        `name.ilike.%${searchQuery}%,generic_name.ilike.%${searchQuery}%,ndc_code.ilike.%${searchQuery}%`
      )
      .limit(20)

    if (!error && data) {
      setMedications(data)
    }
    setLoading(false)
  }, [supabase, searchQuery])

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      searchMedications()
    } else if (open && searchQuery.length === 0) {
      loadRecentMedications()
    }
  }, [searchQuery, open, loadRecentMedications, searchMedications])

  const selectedMedication = medications.find((m) => m.id === value)

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        Medication {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select or search for a medication">
            {selectedMedication
              ? `${selectedMedication.name}${selectedMedication.strength ? ` (${selectedMedication.strength})` : ""}`
              : "Select or search for a medication"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, generic name, or NDC..."
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
          ) : medications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No medications found
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {medications.map((medication) => (
                <SelectItem key={medication.id} value={medication.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{medication.name}</span>
                    {medication.generic_name && (
                      <span className="text-xs text-muted-foreground">
                        Generic: {medication.generic_name}
                      </span>
                    )}
                    {medication.strength && medication.dosage_form && (
                      <span className="text-xs text-muted-foreground">
                        {medication.strength} {medication.dosage_form}
                      </span>
                    )}
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
