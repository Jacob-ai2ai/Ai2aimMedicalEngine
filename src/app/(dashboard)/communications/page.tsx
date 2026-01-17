import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CommunicationsPage() {
  const supabase = await createServerSupabase()

  const { data: communications } = await supabase
    .from("communications")
    .select(`
      *,
      patients:patient_id (
        first_name,
        last_name,
        patient_id
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground">Manage letters, referrals, and messages</p>
        </div>
        <Button asChild>
          <Link href="/communications/new">New Communication</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {communications && communications.length > 0 ? (
          communications.map((communication: any) => (
            <Card key={communication.id} className={communication.is_read ? "" : "border-primary"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {communication.subject || "No Subject"}
                      {!communication.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {communication.communication_type} - {communication.direction}
                      {communication.patients && (
                        <> - {communication.patients.first_name} {communication.patients.last_name}</>
                      )}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(communication.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {communication.content}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/communications/${communication.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No communications found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
