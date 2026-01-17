"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PFTTest } from "@/lib/medical/pft-service"
import { cn } from "@/lib/utils"
import { Calendar, Stethoscope, MapPin, FileText, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface PFTTestCardProps {
  test: PFTTest
  patientName?: string
  className?: string
  onClick?: () => void
}

export function PFTTestCard({
  test,
  patientName,
  className,
  onClick,
}: PFTTestCardProps) {
  const statusConfig = {
    scheduled: {
      label: "Scheduled",
      variant: "outline" as const,
      color: "text-blue-400",
    },
    in_progress: {
      label: "In Progress",
      variant: "warning" as const,
      color: "text-orange-400",
    },
    completed: {
      label: "Completed",
      variant: "success" as const,
      color: "text-green-400",
    },
    cancelled: {
      label: "Cancelled",
      variant: "destructive" as const,
      color: "text-red-400",
    },
  }

  const testTypeLabels = {
    spirometry: "Spirometry",
    lung_volume: "Lung Volume",
    diffusion_capacity: "Diffusion Capacity",
    full_pft: "Full PFT",
  }

  const config =
    statusConfig[test.status as keyof typeof statusConfig] ||
    statusConfig.scheduled

  return (
    <Card
      className={cn(className, onClick && "cursor-pointer hover:bg-muted/50")}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {testTypeLabels[test.test_type] || test.test_type}
          </CardTitle>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        {patientName && (
          <p className="text-sm text-muted-foreground">{patientName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {test.test_date && (
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Test Date
              </p>
              <p className="font-medium">
                {new Date(test.test_date).toLocaleDateString()}
              </p>
            </div>
          )}
          {test.location && (
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </p>
              <p className="font-medium">{test.location.name}</p>
            </div>
          )}
          {test.indication && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Indication</p>
              <p className="font-medium capitalize">{test.indication}</p>
            </div>
          )}
        </div>
        {test.notes && (
          <div className="text-sm">
            <p className="text-muted-foreground">Notes</p>
            <p className="mt-1">{test.notes}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Link href={`/pft/tests/${test.id}`}>
            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
