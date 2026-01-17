"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, User, Calendar, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrescriptionCardProps {
  prescription: {
    id: string
    prescription_number: string
    status: string
    dosage: string
    quantity: number
    refills: number
    instructions?: string
    created_at: string
    patients?: {
      first_name: string
      last_name: string
      patient_id: string
    }
    medications?: {
      name: string
      dosage_form?: string
    }
  }
  className?: string
}

const statusColors = {
  pending: "warning",
  approved: "info",
  rejected: "destructive",
  filled: "success",
  dispensed: "success",
  cancelled: "outline",
} as const

export function PrescriptionCard({ prescription, className }: PrescriptionCardProps) {
  const statusColor = statusColors[prescription.status as keyof typeof statusColors] || "outline"

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              RX #{prescription.prescription_number}
            </CardTitle>
            <CardDescription className="mt-1">
              {prescription.patients?.first_name} {prescription.patients?.last_name}
              {prescription.patients?.patient_id && ` - ID: ${prescription.patients.patient_id}`}
            </CardDescription>
          </div>
          <Badge variant={statusColor as any}>
            {prescription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Medication:</span>
            <span className="text-muted-foreground">
              {prescription.medications?.name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Dosage:</span>
            <span className="text-muted-foreground">{prescription.dosage}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Quantity:</span>
            <span className="text-muted-foreground">
              {prescription.quantity} {prescription.medications?.dosage_form || ""}
            </span>
          </div>
          {prescription.refills > 0 && (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Refills:</span>
              <span className="text-muted-foreground">{prescription.refills}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(prescription.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {prescription.instructions && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-1">Instructions:</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {prescription.instructions}
            </p>
          </div>
        )}
        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/prescriptions/${prescription.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
