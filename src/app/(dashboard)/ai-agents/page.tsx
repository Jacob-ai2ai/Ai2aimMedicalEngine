import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Activity, MessageSquare, Settings, Clock, CheckCircle, XCircle, Loader } from "lucide-react"
import Link from "next/link"

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

  // Get active sessions count
  const { count: activeSessionsCount } = await supabase
    .from("ai_sessions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const activeAgentsCount = agents?.filter((a) => a.is_active).length || 0

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Agents
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor AI agent interactions
          </p>
        </div>
        <Button variant="outline" size="lg" asChild>
          <Link href="/ai-agents/configure">
            <Settings className="h-4 w-4 mr-2" />
            Configure Agents
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeAgentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {agents?.length || 0} total agents
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeSessionsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentSessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Recent interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Agents</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents && agents.length > 0 ? (
            agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="mt-1 capitalize">
                        {agent.role} • {agent.agent_type}
                      </CardDescription>
                    </div>
                    {agent.is_active ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                  )}
                  {agent.capabilities && Array.isArray(agent.capabilities) && agent.capabilities.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2 text-muted-foreground">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 4).map((cap: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {typeof cap === "string" ? cap : cap.name || cap}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.capabilities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/ai-agents/${agent.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Session
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No AI agents found</h3>
                <p className="text-muted-foreground">Agents will appear here once configured</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Agent Sessions
          </CardTitle>
          <CardDescription>Latest AI agent interactions and conversations</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session: any) => {
                const StatusIcon =
                  session.status === "active"
                    ? Loader
                    : session.status === "completed"
                    ? CheckCircle
                    : XCircle

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {session.ai_agents?.name || "Unknown Agent"}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {session.ai_agents?.role || "N/A"} • Session ID: {session.id.slice(0, 8)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(session.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          session.status === "active"
                            ? "info"
                            : session.status === "completed"
                            ? "success"
                            : "destructive"
                        }
                        className="flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {session.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/ai-agents/sessions/${session.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">No recent sessions</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a conversation with an AI agent to see sessions here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
