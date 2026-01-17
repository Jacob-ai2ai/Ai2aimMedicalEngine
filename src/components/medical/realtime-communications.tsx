"use client"

import { useRealtime } from "@/hooks/use-realtime"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RealtimeCommunications() {
  const communications = useRealtime("communications", "is_read=false", (payload) => {
    console.log("Communication updated:", payload)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Communications</CardTitle>
        <CardDescription>Real-time communication updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {communications.slice(0, 5).map((communication: any) => (
            <div
              key={communication.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {communication.subject || "No Subject"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {communication.communication_type}
                </p>
              </div>
              {!communication.is_read && (
                <span className="h-2 w-2 rounded-full bg-primary ml-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
