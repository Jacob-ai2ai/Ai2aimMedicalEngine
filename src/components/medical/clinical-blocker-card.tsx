"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, User, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ClinicalBlockerCardProps {
  blocker: {
    id: string
    patient_id: string
    encounter_date: string
    encounter_type?: string
    billing_status: string
    patient: {
      first_name: string
      last_name: string
      patient_id: string
    }
  }
  onResolve?: (id: string) => void
  className?: string
}

export function ClinicalBlockerCard({
  blocker,
  onResolve,
  className,
}: ClinicalBlockerCardProps) {
  const daysSinceEncounter = Math.floor(
    (new Date().getTime() - new Date(blocker.encounter_date).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <Card
      className={cn(
        "border-l-4 border-l-orange-500 bg-orange-50/5 hover:bg-orange-50/10 transition-all duration-300",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold">Unbilled Encounter</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>
                {blocker.patient.first_name} {blocker.patient.last_name} (
                {blocker.patient.patient_id})
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(blocker.encounter_date).toLocaleDateString()} (
                {daysSinceEncounter} days ago)
              </span>
              {blocker.encounter_type && (
                <span className="ml-2 capitalize">• {blocker.encounter_type}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs"
            >
              <Link href={`/patients/${blocker.patient_id}`}>View Patient</Link>
            </Button>
            {onResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onResolve(blocker.id)}
                className="text-xs"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Bill Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
