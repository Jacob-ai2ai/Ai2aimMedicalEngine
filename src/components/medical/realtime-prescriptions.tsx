"use client"

import { useRealtime } from "@/hooks/use-realtime"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RealtimePrescriptions() {
  const prescriptions = useRealtime("prescriptions", undefined, (payload) => {
    console.log("Prescription updated:", payload)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Prescriptions</CardTitle>
        <CardDescription>Real-time prescription updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {prescriptions.slice(0, 5).map((prescription: any) => (
            <div
              key={prescription.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">RX #{prescription.prescription_number}</p>
                <p className="text-xs text-muted-foreground capitalize">{prescription.status}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  prescription.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : prescription.status === "approved"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {prescription.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
