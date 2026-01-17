import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PrescriptionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data: prescription } = await supabase
    .from("prescriptions")
    .select(`
      *,
      patients:patient_id (
        id,
        first_name,
        last_name,
        patient_id,
        date_of_birth,
        phone,
        email
      ),
      medications:medication_id (
        name,
        generic_name,
        dosage_form,
        strength
      )
    `)
    .eq("id", params.id)
    .single()

  if (!prescription) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prescription Details</h1>
          <p className="text-muted-foreground">RX #{prescription.prescription_number}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/prescriptions">Back to List</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground capitalize">{prescription.status}</p>
            </div>
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
            {prescription.instructions && (
              <div>
                <p className="text-sm font-medium">Instructions</p>
                <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
              </div>
            )}
            {prescription.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{prescription.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {prescription.patients?.first_name} {prescription.patients?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Patient ID</p>
              <p className="text-sm text-muted-foreground">{prescription.patients?.patient_id}</p>
            </div>
            {prescription.patients?.date_of_birth && (
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(prescription.patients.date_of_birth).toLocaleDateString()}
                </p>
              </div>
            )}
            {prescription.patients?.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{prescription.patients.phone}</p>
              </div>
            )}
            {prescription.patients?.email && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{prescription.patients.email}</p>
              </div>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/patients/${prescription.patients?.id}`}>View Patient</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
