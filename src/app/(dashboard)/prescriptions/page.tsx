import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PrescriptionsPage() {
  const supabase = await createServerSupabase()

  const { data: prescriptions } = await supabase
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
    .limit(50)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Manage and track prescriptions</p>
        </div>
        <Button asChild>
          <Link href="/prescriptions/new">New Prescription</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {prescriptions && prescriptions.length > 0 ? (
          prescriptions.map((prescription: any) => (
            <Card key={prescription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>RX #{prescription.prescription_number}</CardTitle>
                    <CardDescription>
                      {prescription.patients?.first_name} {prescription.patients?.last_name} - 
                      Patient ID: {prescription.patients?.patient_id}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      prescription.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : prescription.status === "approved"
                        ? "bg-blue-100 text-blue-800"
                        : prescription.status === "filled"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {prescription.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Medication</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.medications?.name} ({prescription.dosage})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Quantity</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.quantity} {prescription.medications?.dosage_form}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Refills</p>
                    <p className="text-sm text-muted-foreground">{prescription.refills}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {prescription.instructions && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Instructions</p>
                    <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/prescriptions/${prescription.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No prescriptions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
