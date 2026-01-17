import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CommunicationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data: communication } = await supabase
    .from("communications")
    .select(`
      *,
      patients:patient_id (
        id,
        first_name,
        last_name,
        patient_id
      )
    `)
    .eq("id", params.id)
    .single()

  if (!communication) {
    notFound()
  }

  // Mark as read
  if (!communication.is_read) {
    await supabase
      .from("communications")
      .update({ is_read: true })
      .eq("id", params.id)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {communication.subject || "Communication Details"}
          </h1>
          <p className="text-muted-foreground capitalize">
            {communication.communication_type} - {communication.direction}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/communications">Back to List</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{communication.content}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {communication.communication_type}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Direction</p>
              <p className="text-sm text-muted-foreground capitalize">
                {communication.direction}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(communication.created_at).toLocaleString()}
              </p>
            </div>
            {communication.patients && (
              <div>
                <p className="text-sm font-medium">Patient</p>
                <p className="text-sm text-muted-foreground">
                  {communication.patients.first_name} {communication.patients.last_name} (
                  {communication.patients.patient_id})
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href={`/patients/${communication.patients.id}`}>View Patient</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {communication.metadata && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(communication.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
