import { createServerSupabase } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PatientsPage() {
  const supabase = await createServerSupabase()

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .order("last_name", { ascending: true })
    .limit(50)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
        <Button asChild>
          <Link href="/patients/new">Add Patient</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients && patients.length > 0 ? (
          patients.map((patient) => (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle>
                  {patient.first_name} {patient.last_name}
                </CardTitle>
                <CardDescription>Patient ID: {patient.patient_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.date_of_birth && (
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {patient.phone && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </div>
                )}
                {patient.email && (
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href={`/patients/${patient.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No patients found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
