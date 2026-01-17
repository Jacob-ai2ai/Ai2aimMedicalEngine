"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Prescription } from "@/types/database"
import { createClientSupabase } from "@/lib/supabase/client"
import { formatPrescriptionDate, getStatusColor } from "@/lib/medical/prescription-utils"
import { Plus, Search, Filter } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DMEPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  async function fetchPrescriptions() {
    setLoading(true)
    try {
      const supabase = createClientSupabase()
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          patients:patient_id (
            first_name,
            last_name,
            patient_id
          ),
          dme_prescriptions (
            *,
            equipment:dme_equipment_id (
              name,
              category
            )
          )
        `)
        .eq("is_dme", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching DME prescriptions:", error)
      } else {
        setPrescriptions(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      prescription.prescription_number.toLowerCase().includes(search) ||
      prescription.patients?.first_name?.toLowerCase().includes(search) ||
      prescription.patients?.last_name?.toLowerCase().includes(search) ||
      prescription.dme_prescriptions?.[0]?.equipment?.name?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neural-glow">DME Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage durable medical equipment prescriptions
          </p>
        </div>
        <Button asChild>
          <Link href="/dme/prescriptions/new">
            <Plus className="h-4 w-4 mr-2" />
            New DME Prescription
          </Link>
        </Button>
      </div>

      <Card className="aeterna-glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prescriptions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : filteredPrescriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No DME prescriptions found</p>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription: any) => {
                const dmePrescription = prescription.dme_prescriptions?.[0]
                const equipment = dmePrescription?.equipment

                return (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <p className="font-semibold">
                          {equipment?.name || "Unknown Equipment"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          RX #{prescription.prescription_number} •{" "}
                          {prescription.patients?.first_name}{" "}
                          {prescription.patients?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dmePrescription?.rental_or_purchase === "rental"
                            ? `Rental - ${dmePrescription.duration_months || "N/A"} months`
                            : "Purchase"}
                          {dmePrescription?.insurance_authorization_number &&
                            ` • Auth: ${dmePrescription.insurance_authorization_number}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={getStatusColor(prescription.status) as any}
                        className="capitalize"
                      >
                        {prescription.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/prescriptions/${prescription.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
