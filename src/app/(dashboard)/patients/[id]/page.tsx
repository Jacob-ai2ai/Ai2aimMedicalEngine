import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!patient) {
    notFound()
  }

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select(`
      *,
      medications:medication_id (
        name,
        dosage_form
      )
    `)
    .eq("patient_id", params.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/patients">Back to List</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">
                {patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-sm text-muted-foreground">{patient.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{patient.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{patient.email || "N/A"}</p>
            </div>
            {patient.address_line1 && (
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {patient.address_line1}
                  {patient.address_line2 && `, ${patient.address_line2}`}
                  {patient.city && `, ${patient.city}`}
                  {patient.state && `, ${patient.state}`}
                  {patient.zip_code && ` ${patient.zip_code}`}
                </p>
              </div>
            )}
            {patient.insurance_provider && (
              <div>
                <p className="text-sm font-medium">Insurance</p>
                <p className="text-sm text-muted-foreground">
                  {patient.insurance_provider} ({patient.insurance_id})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.allergies && (
              <div>
                <p className="text-sm font-medium">Allergies</p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(patient.allergies)
                    ? patient.allergies.join(", ")
                    : JSON.stringify(patient.allergies)}
                </p>
              </div>
            )}
            {patient.medical_history && (
              <div>
                <p className="text-sm font-medium">Medical History</p>
                <p className="text-sm text-muted-foreground">
                  {typeof patient.medical_history === "string"
                    ? patient.medical_history
                    : JSON.stringify(patient.medical_history)}
                </p>
              </div>
            )}
            {patient.emergency_contact_name && (
              <div>
                <p className="text-sm font-medium">Emergency Contact</p>
                <p className="text-sm text-muted-foreground">
                  {patient.emergency_contact_name} - {patient.emergency_contact_phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription History</CardTitle>
          <CardDescription>Recent prescriptions for this patient</CardDescription>
        </CardHeader>
        <CardContent>
          {prescriptions && prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription: any) => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {prescription.medications?.name} - {prescription.dosage}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      RX #{prescription.prescription_number} - {prescription.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(prescription.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/prescriptions/${prescription.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No prescriptions found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
