import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AutomationsPage() {
  const supabase = await createServerSupabase()

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .order("priority", { ascending: false })
    .limit(50)

  // Get recent runs
  const { data: recentRuns } = await supabase
    .from("automation_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="text-muted-foreground">Manage automation workflows</p>
        </div>
        <Button asChild>
          <Link href="/automations/new">Create Automation</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Automations</CardTitle>
            <CardDescription>Currently active automation workflows</CardDescription>
          </CardHeader>
          <CardContent>
            {automations && automations.length > 0 ? (
              <div className="space-y-4">
                {automations
                  .filter((auto) => auto.is_active)
                  .map((automation) => (
                    <div
                      key={automation.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{automation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {automation.description || "No description"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Trigger: {automation.trigger_config?.type || "N/A"} | Action:{" "}
                          {automation.action_config?.type || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active automations</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Runs</CardTitle>
            <CardDescription>Latest automation executions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns && recentRuns.length > 0 ? (
              <div className="space-y-4">
                {recentRuns.map((run: any) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {run.status === "success" ? "✓" : run.status === "failed" ? "✗" : "○"}{" "}
                        {run.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(run.started_at).toLocaleString()}
                      </p>
                      {run.duration_ms && (
                        <p className="text-xs text-muted-foreground">
                          Duration: {run.duration_ms}ms
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        run.status === "success"
                          ? "bg-green-100 text-green-800"
                          : run.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent runs</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Automations</CardTitle>
          <CardDescription>Complete list of automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          {automations && automations.length > 0 ? (
            <div className="space-y-4">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{automation.name}</p>
                      {automation.is_active ? (
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {automation.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Priority: {automation.priority} | Trigger:{" "}
                      {automation.trigger_config?.type || "N/A"} | Action:{" "}
                      {automation.action_config?.type || "N/A"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/automations/${automation.id}`}>View Details</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No automations found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
