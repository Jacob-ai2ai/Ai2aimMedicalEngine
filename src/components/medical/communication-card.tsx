"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, ArrowRight, ArrowLeft, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommunicationCardProps {
  communication: {
    id: string
    subject?: string
    content: string
    communication_type: string
    direction: string
    is_read: boolean
    created_at: string
    patients?: {
      first_name: string
      last_name: string
      patient_id: string
    }
  }
  className?: string
}

const typeIcons = {
  letter: Mail,
  referral: Mail,
  message: Mail,
  notification: Mail,
}

export function CommunicationCard({ communication, className }: CommunicationCardProps) {
  const Icon = typeIcons[communication.communication_type as keyof typeof typeIcons] || Mail
  const isUnread = !communication.is_read

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        isUnread && "border-primary border-2",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {communication.subject || "No Subject"}
              {isUnread && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {communication.communication_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {communication.direction === "inbound" ? (
                  <ArrowRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowLeft className="h-3 w-3 mr-1" />
                )}
                {communication.direction}
              </Badge>
              {communication.patients && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {communication.patients.first_name} {communication.patients.last_name}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {communication.content}
        </p>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(communication.created_at).toLocaleDateString()}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/communications/${communication.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
