"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PFTResultsForm } from "@/components/sleep-clinic/pft-results-form"
import { PFTInterpretationViewer } from "@/components/sleep-clinic/pft-interpretation-viewer"
import { SpirometryChart } from "@/components/sleep-clinic/spirometry-chart"
import type {
  PFTTest,
  PFTResult,
  PFTInterpretation,
} from "@/lib/medical/pft-service"
import { createClientSupabase } from "@/lib/supabase/client"
import { Patient } from "@/types/database"
import { toast } from "sonner"
import { ArrowLeft, FileText, BarChart3, Stethoscope } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PFTTestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [test, setTest] = useState<PFTTest | null>(null)
  const [result, setResult] = useState<PFTResult | null>(null)
  const [interpretation, setInterpretation] = useState<PFTInterpretation | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchTestData()
  }, [testId])

  async function fetchTestData() {
    setLoading(true)
    try {
      // Fetch test data via API
      const testResponse = await fetch(`/api/pft/tests/${testId}`)
      let testData = null
      if (testResponse.ok) {
        testData = await testResponse.json()
        setTest(testData.test || testData)
      }

      // Fetch results via API
      const resultsResponse = await fetch(`/api/pft/tests/${testId}/results`)
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json()
        setResult(resultsData.result || resultsData)
      }

      // Fetch interpretation via API
      const interpretationResponse = await fetch(`/api/pft/tests/${testId}/interpret`)
      if (interpretationResponse.ok) {
        const interpretationData = await interpretationResponse.json()
        setInterpretation(interpretationData.interpretation || interpretationData)
      }

      // Fetch patient if we have test data
      const currentTest = testData?.test || testData
      if (currentTest?.patient_id) {
        const supabase = createClientSupabase()
        const { data: patientData } = await supabase
          .from("patients")
          .select("*")
          .eq("id", currentTest.patient_id)
          .single()

        if (patientData) {
          setPatient(patientData)
        }
      }
    } catch (error) {
      console.error("Error fetching PFT test:", error)
      toast.error("Failed to load PFT test")
    } finally {
      setLoading(false)
    }
  }

  const handleResultsSaved = () => {
    fetchTestData()
    setActiveTab("results")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">PFT test not found</div>
      </div>
    )
  }

  const testTypeLabels = {
    spirometry: "Spirometry",
    lung_volume: "Lung Volume",
    diffusion_capacity: "Diffusion Capacity",
    full_pft: "Full PFT",
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {testTypeLabels[test.test_type] || test.test_type}
          </h1>
          {patient && (
            <p className="text-muted-foreground">
              {patient.first_name} {patient.last_name} ({patient.patient_id})
            </p>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          {result && <TabsTrigger value="interpretation">Interpretation</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">{test.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Test Date</p>
                  <p className="font-medium">
                    {new Date(test.test_date).toLocaleDateString()}
                  </p>
                </div>
                {test.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{test.location.name}</p>
                  </div>
                )}
                {test.indication && (
                  <div>
                    <p className="text-sm text-muted-foreground">Indication</p>
                    <p className="font-medium capitalize">{test.indication}</p>
                  </div>
                )}
              </div>
              {test.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{test.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {result ? (
            <>
              <SpirometryChart result={result} />
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {result.fev1_liters != null && (
                      <div>
                        <p className="text-muted-foreground">FEV1</p>
                        <p className="font-medium">{result.fev1_liters.toFixed(2)} L</p>
                        {result.fev1_percent_predicted != null && (
                          <p className="text-xs text-muted-foreground">
                            {result.fev1_percent_predicted.toFixed(1)}% predicted
                          </p>
                        )}
                      </div>
                    )}
                    {result.fvc_liters != null && (
                      <div>
                        <p className="text-muted-foreground">FVC</p>
                        <p className="font-medium">{result.fvc_liters.toFixed(2)} L</p>
                        {result.fvc_percent_predicted != null && (
                          <p className="text-xs text-muted-foreground">
                            {result.fvc_percent_predicted.toFixed(1)}% predicted
                          </p>
                        )}
                      </div>
                    )}
                    {result.fev1_fvc_ratio != null && (
                      <div>
                        <p className="text-muted-foreground">FEV1/FVC</p>
                        <p className="font-medium">{result.fev1_fvc_ratio.toFixed(3)}</p>
                      </div>
                    )}
                    {result.tlc_liters != null && (
                      <div>
                        <p className="text-muted-foreground">TLC</p>
                        <p className="font-medium">{result.tlc_liters.toFixed(2)} L</p>
                        {result.tlc_percent_predicted != null && (
                          <p className="text-xs text-muted-foreground">
                            {result.tlc_percent_predicted.toFixed(1)}% predicted
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <PFTResultsForm
              testId={testId}
              patientId={test.patient_id}
              onSuccess={handleResultsSaved}
            />
          )}
        </TabsContent>

        {result && (
          <TabsContent value="interpretation" className="space-y-4">
            {interpretation ? (
              <PFTInterpretationViewer interpretation={interpretation} />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No interpretation available yet
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
