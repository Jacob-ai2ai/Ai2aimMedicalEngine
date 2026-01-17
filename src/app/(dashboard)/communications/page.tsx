import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Plus, Search, Mail, Filter, Inbox } from "lucide-react"
import { CommunicationCard } from "@/components/medical/communication-card"

export default async function CommunicationsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; direction?: string; unread?: string }
}) {
  const supabase = await createServerSupabase()

  let query = supabase
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
    .limit(100)

  if (searchParams.search) {
    query = query.or(
      `subject.ilike.%${searchParams.search}%,content.ilike.%${searchParams.search}%,patients.first_name.ilike.%${searchParams.search}%,patients.last_name.ilike.%${searchParams.search}%`
    )
  }

  if (searchParams.type && searchParams.type !== "all") {
    query = query.eq("communication_type", searchParams.type)
  }

  if (searchParams.direction && searchParams.direction !== "all") {
    query = query.eq("direction", searchParams.direction)
  }

  if (searchParams.unread === "true") {
    query = query.eq("is_read", false)
  }

  const { data: communications } = await query

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("communications")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Communications
            {unreadCount && unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage letters, referrals, and messages
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/communications/new">
            <Plus className="h-4 w-4 mr-2" />
            New Communication
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search by subject, content, or patient..."
                  className="pl-10"
                  defaultValue={searchParams.search}
                />
              </div>
              <Select name="type" defaultValue={searchParams.type || "all"}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
              <Select name="direction" defaultValue={searchParams.direction || "all"}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Apply Filters</Button>
              <Button
                type="submit"
                variant={searchParams.unread === "true" ? "default" : "outline"}
                name="unread"
                value="true"
              >
                <Inbox className="h-4 w-4 mr-2" />
                Unread Only
              </Button>
              {(searchParams.search || searchParams.type || searchParams.direction || searchParams.unread) && (
                <Button variant="outline" asChild>
                  <Link href="/communications">Clear</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Communications List */}
      {communications && communications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {communications.map((communication: any) => (
            <CommunicationCard key={communication.id} communication={communication} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No communications found</h3>
            <p className="text-muted-foreground mb-6">
              {searchParams.search || searchParams.type || searchParams.direction
                ? "Try adjusting your filters"
                : "Get started by creating your first communication"}
            </p>
            <Button asChild>
              <Link href="/communications/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Communication
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {communications && communications.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {communications.length} communication{communications.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
