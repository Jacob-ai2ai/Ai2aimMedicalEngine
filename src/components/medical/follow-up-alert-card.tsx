"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FollowUpAlertCardProps {
  followUp: {
    id: string
    patient_id: string
    follow_up_type: "72h" | "3m" | "6m"
    due_date: string
    status: "pending" | "completed" | "overdue" | "cancelled"
    daysOverdue?: number
    patient?: {
      first_name: string
      last_name: string
      patient_id: string
      phone?: string
    }
    encounter?: {
      encounter_date: string
      encounter_type?: string
    }
  }
  onComplete?: (id: string) => void
  className?: string
}

export function FollowUpAlertCard({
  followUp,
  onComplete,
  className,
}: FollowUpAlertCardProps) {
  const isOverdue = followUp.status === "overdue" || (followUp.daysOverdue && followUp.daysOverdue > 0)
  const typeLabel = {
    "72h": "72-Hour",
    "3m": "3-Month",
    "6m": "6-Month",
  }[followUp.follow_up_type]

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-300",
        isOverdue
          ? "border-l-red-500 bg-red-50/5 hover:bg-red-50/10"
          : "border-l-yellow-500 bg-yellow-50/5 hover:bg-yellow-50/10",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle
                className={cn(
                  "h-4 w-4",
                  isOverdue ? "text-red-500" : "text-yellow-500"
                )}
              />
              <span className="text-sm font-bold">
                {typeLabel} Follow-up {isOverdue && `(${followUp.daysOverdue} days overdue)`}
              </span>
            </div>

            {followUp.patient && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>
                  {followUp.patient.first_name} {followUp.patient.last_name} (
                  {followUp.patient.patient_id})
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Due: {new Date(followUp.due_date).toLocaleDateString()}</span>
              {followUp.encounter && (
                <>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>
                    Encounter: {new Date(followUp.encounter.encounter_date).toLocaleDateString()}
                  </span>
                </>
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
              <Link href={`/patients/${followUp.patient_id}`}>View Patient</Link>
            </Button>
            {onComplete && followUp.status === "pending" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onComplete(followUp.id)}
                className="text-xs"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
