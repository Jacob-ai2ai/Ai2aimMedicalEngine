import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AIAgentsPage() {
  const supabase = await createServerSupabase()

  const { data: agents } = await supabase
    .from("ai_agents")
    .select("*")
    .order("name", { ascending: true })

  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from("ai_sessions")
    .select(`
      *,
      ai_agents:agent_id (
        name,
        role
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">Manage and monitor AI agents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents &&
          agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  {agent.is_active ? (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                  )}
                </div>
                <CardDescription className="capitalize">
                  {agent.role} - {agent.agent_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {agent.description && (
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                )}
                {agent.capabilities && (
                  <div>
                    <p className="text-xs font-medium mb-1">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(agent.capabilities) &&
                        agent.capabilities.slice(0, 3).map((cap: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {cap.name || cap}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Agent Sessions</CardTitle>
          <CardDescription>Latest AI agent interactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{session.ai_agents?.name || "Unknown Agent"}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Status: {session.status} | Role: {session.ai_agents?.role || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      session.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : session.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent sessions</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
