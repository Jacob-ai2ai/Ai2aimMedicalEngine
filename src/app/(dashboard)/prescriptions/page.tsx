import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Plus, Search, Pill, Filter } from "lucide-react"
import { PrescriptionCard } from "@/components/medical/prescription-card"

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from("prescriptions")
    .select(`
      *,
      patients:patient_id (
        first_name,
        last_name,
        patient_id
      ),
      medications:medication_id (
        name,
        dosage_form
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  if (searchParams.search) {
    query = query.or(
      `prescription_number.ilike.%${searchParams.search}%,patients.first_name.ilike.%${searchParams.search}%,patients.last_name.ilike.%${searchParams.search}%`
    )
  }

  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status)
  }

  const { data: prescriptions } = await query

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <Pill className="h-8 w-8 text-primary" />
            Prescriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track prescription workflow
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/prescriptions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by RX number, patient name..."
                className="pl-10"
                defaultValue={searchParams.search}
              />
            </div>
            <Select name="status" defaultValue={searchParams.status || "all"}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="dispensed">Dispensed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Apply Filters</Button>
            {(searchParams.search || searchParams.status) && (
              <Button variant="outline" asChild>
                <Link href="/prescriptions">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Prescriptions Grid */}
      {prescriptions && prescriptions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription: any) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No prescriptions found</h3>
            <p className="text-muted-foreground mb-6">
              {searchParams.search || searchParams.status
                ? "Try adjusting your filters"
                : "Get started by creating your first prescription"}
            </p>
            <Button asChild>
              <Link href="/prescriptions/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Prescription
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {prescriptions && prescriptions.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
