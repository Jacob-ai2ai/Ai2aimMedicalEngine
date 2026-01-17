"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SleepStudy } from "@/lib/medical/sleep-study-service"
import { cn } from "@/lib/utils"
import { Calendar, Stethoscope, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface SleepStudyCardProps {
  study: SleepStudy
  patientName?: string
  className?: string
  onClick?: () => void
}

export function SleepStudyCard({
  study,
  patientName,
  className,
  onClick,
}: SleepStudyCardProps) {
  const statusConfig = {
    ordered: { label: "Ordered", variant: "outline" as const, color: "text-blue-400" },
    dispatched: { label: "Dispatched", variant: "info" as const, color: "text-yellow-400" },
    in_progress: { label: "In Progress", variant: "warning" as const, color: "text-orange-400" },
    completed: { label: "Completed", variant: "secondary" as const, color: "text-gray-400" },
    interpreted: { label: "Interpreted", variant: "success" as const, color: "text-green-400" },
  }

  const config = statusConfig[study.status as keyof typeof statusConfig] || statusConfig.ordered

  return (
    <Card className={cn(className, onClick && "cursor-pointer hover:bg-muted/50")} onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {study.study_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </CardTitle>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        {patientName && (
          <p className="text-sm text-muted-foreground">{patientName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {study.study_date && (
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Study Date
              </p>
              <p className="font-medium">
                {new Date(study.study_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {study.monitor_serial_number && (
            <div>
              <p className="text-muted-foreground">Monitor Serial</p>
              <p className="font-medium">{study.monitor_serial_number}</p>
            </div>
          )}
          {study.dispatch_date && (
            <div>
              <p className="text-muted-foreground">Dispatched</p>
              <p className="font-medium">
                {new Date(study.dispatch_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {study.return_date && (
            <div>
              <p className="text-muted-foreground">Returned</p>
              <p className="font-medium">
                {new Date(study.return_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {study.diagnosis && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Diagnosis</p>
            <p className="font-medium">{study.diagnosis}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/sleep-studies/${study.id}`}>View Details</Link>
          </Button>
          {study.status === "completed" && !study.interpreted_by && (
            <Button variant="default" size="sm" asChild>
              <Link href={`/sleep-studies/${study.id}/interpret`}>Interpret</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
