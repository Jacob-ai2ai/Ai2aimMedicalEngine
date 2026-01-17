import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function AutomationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data: automation } = await supabase
    .from("automations")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!automation) {
    notFound()
  }

  const { data: runs } = await supabase
    .from("automation_runs")
    .select("*")
    .eq("automation_id", params.id)
    .order("started_at", { ascending: false })
    .limit(20)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{automation.name}</h1>
          <p className="text-muted-foreground">{automation.description || "No description"}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/automations">Back to List</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trigger Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {automation.trigger_config?.type || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Configuration</p>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(automation.trigger_config, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {automation.action_config?.type || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Configuration</p>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(automation.action_config, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent runs of this automation</CardDescription>
        </CardHeader>
        <CardContent>
          {runs && runs.length > 0 ? (
            <div className="space-y-4">
              {runs.map((run: any) => (
                <div
                  key={run.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          run.status === "success"
                            ? "bg-green-500"
                            : run.status === "failed"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="font-medium capitalize">{run.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(run.started_at).toLocaleString()}
                    </span>
                  </div>
                  {run.duration_ms && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {run.duration_ms}ms
                    </p>
                  )}
                  {run.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-800">{run.error_message}</p>
                    </div>
                  )}
                  {run.output_data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        View Output
                      </summary>
                      <pre className="mt-2 bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(run.output_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No execution history</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
