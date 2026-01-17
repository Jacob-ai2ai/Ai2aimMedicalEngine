import { createServiceRoleClient } from "@/lib/supabase/client"

export interface DiagnosticAudit {
  id: string
  entity_type: string
  entity_id: string
  issue_type: string
  severity: "Low" | "Medium" | "High"
  status: "Open" | "Resolved" | "Investigating"
  detected_at: string
  resolved_at: string | null
  notes: string | null
}

export interface PatientWithoutEncounter {
  patient_id: string
  first_name: string
  last_name: string
  created_at: string
  daysSinceCreation: number
}

export class DiagnosticService {
  private supabase = createServiceRoleClient()

  /**
   * Detect patients without encounters
   * FR-016.1
   */
  async detectPatientsWithoutEncounters(): Promise<number> {
    // First, get all patient IDs that have encounters
    const { data: patientsWithEncounters } = await this.supabase
      .from("encounters")
      .select("patient_id")
      .limit(10000)

    const patientIdsWithEncounters = new Set(
      (patientsWithEncounters || []).map((e: any) => e.patient_id)
    )

    // Find patients that have no encounters
    const { data: allPatients, error } = await this.supabase
      .from("patients")
      .select("id, patient_id, first_name, last_name, created_at")
      .limit(10000)

    if (error) {
      console.error("Error detecting patients without encounters:", error)
      return 0
    }

    const patients = (allPatients || []).filter(
      (p: any) => !patientIdsWithEncounters.has(p.id)
    )

    if (!patients || patients.length === 0) {
      return 0
    }

    let createdCount = 0

    for (const patient of patients) {
      // Check if audit already exists
      const { data: existing } = await this.supabase
        .from("diagnostic_audits")
        .select("id")
        .eq("entity_type", "Patient")
        .eq("entity_id", patient.id)
        .eq("issue_type", "Missing Encounter")
        .eq("status", "Open")
        .single()

      if (!existing) {
        // Calculate days since patient creation
        const daysSinceCreation = Math.floor(
          (new Date().getTime() - new Date(patient.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )

        // Determine severity based on how long patient has been in system
        let severity: "Low" | "Medium" | "High" = "Low"
        if (daysSinceCreation > 90) {
          severity = "High"
        } else if (daysSinceCreation > 30) {
          severity = "Medium"
        }

        await this.supabase.from("diagnostic_audits").insert({
          entity_type: "Patient",
          entity_id: patient.id,
          issue_type: "Missing Encounter",
          severity,
          status: "Open",
          notes: `Patient ${patient.patient_id} (${patient.first_name} ${patient.last_name}) has been in the system for ${daysSinceCreation} days without any encounters.`,
        })

        createdCount++
      }
    }

    return createdCount
  }

  /**
   * Get list of patients without encounters
   */
  async getPatientsWithoutEncounters(
    limit: number = 50
  ): Promise<PatientWithoutEncounter[]> {
    // First, get all patient IDs that have encounters
    const { data: patientsWithEncounters } = await this.supabase
      .from("encounters")
      .select("patient_id")
      .limit(10000)

    const patientIdsWithEncounters = new Set(
      (patientsWithEncounters || []).map((e: any) => e.patient_id)
    )

    // Get all patients and filter
    const { data: allPatients, error } = await this.supabase
      .from("patients")
      .select("id, patient_id, first_name, last_name, created_at")
      .order("created_at", { ascending: false })
      .limit(limit * 2) // Get more to account for filtering

    if (error) {
      console.error("Error fetching patients without encounters:", error)
      return []
    }

    const patients = (allPatients || []).filter(
      (p: any) => !patientIdsWithEncounters.has(p.id)
    ).slice(0, limit)

    if (error) {
      console.error("Error fetching patients without encounters:", error)
      return []
    }

    if (!patients) {
      return []
    }

    const now = new Date()

    return patients.map((patient) => {
      const daysSinceCreation = Math.floor(
        (now.getTime() - new Date(patient.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )

      return {
        patient_id: patient.patient_id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        created_at: patient.created_at,
        daysSinceCreation,
      }
    })
  }

  /**
   * Detect missing patient descriptors (incomplete demographics)
   * FR-016.3
   */
  async detectMissingPatientDescriptors(): Promise<number> {
    const { data: patients, error } = await this.supabase
      .from("patients")
      .select("id, patient_id, first_name, last_name, date_of_birth, phone, email")

    if (error) {
      console.error("Error detecting missing descriptors:", error)
      return 0
    }

    if (!patients || patients.length === 0) {
      return 0
    }

    let createdCount = 0

    for (const patient of patients) {
      const missingFields: string[] = []

      if (!patient.date_of_birth) missingFields.push("Date of Birth")
      if (!patient.phone) missingFields.push("Phone")
      if (!patient.email) missingFields.push("Email")

      if (missingFields.length > 0) {
        // Check if audit already exists
        const { data: existing } = await this.supabase
          .from("diagnostic_audits")
          .select("id")
          .eq("entity_type", "Patient")
          .eq("entity_id", patient.id)
          .eq("issue_type", "Missing Patient Descriptors")
          .eq("status", "Open")
          .single()

        if (!existing) {
          const severity: "Low" | "Medium" | "High" =
            missingFields.length >= 3 ? "High" : missingFields.length === 2 ? "Medium" : "Low"

          await this.supabase.from("diagnostic_audits").insert({
            entity_type: "Patient",
            entity_id: patient.id,
            issue_type: "Missing Patient Descriptors",
            severity,
            status: "Open",
            notes: `Patient ${patient.patient_id} (${patient.first_name} ${patient.last_name}) is missing: ${missingFields.join(", ")}`,
          })

          createdCount++
        }
      }
    }

    return createdCount
  }

  /**
   * Perform diagnostic IQ audit on communications
   * FR-016.2
   */
  async auditCommunications(limit: number = 100): Promise<number> {
    const { data: communications, error } = await this.supabase
      .from("communications")
      .select("id, patient_id, content, communication_type")
      .is("patient_id", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error auditing communications:", error)
      return 0
    }

    if (!communications || communications.length === 0) {
      return 0
    }

    let createdCount = 0

    for (const comm of communications) {
      // Check if audit already exists
      const { data: existing } = await this.supabase
        .from("diagnostic_audits")
        .select("id")
        .eq("entity_type", "Communication")
        .eq("entity_id", comm.id)
        .eq("issue_type", "Missing Patient Link")
        .eq("status", "Open")
        .single()

      if (!existing) {
        await this.supabase.from("diagnostic_audits").insert({
          entity_type: "Communication",
          entity_id: comm.id,
          issue_type: "Missing Patient Link",
          severity: "Medium",
          status: "Open",
          notes: `Communication ${comm.communication_type} is not linked to a patient.`,
        })

        createdCount++
      }
    }

    return createdCount
  }

  /**
   * Get all diagnostic audits
   */
  async getDiagnosticAudits(
    status?: "Open" | "Resolved" | "Investigating",
    limit: number = 50
  ): Promise<DiagnosticAudit[]> {
    let query = this.supabase
      .from("diagnostic_audits")
      .select("*")
      .order("detected_at", { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching diagnostic audits:", error)
      return []
    }

    return data || []
  }

  /**
   * Resolve a diagnostic audit
   */
  async resolveAudit(auditId: string, notes?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("diagnostic_audits")
      .update({
        status: "Resolved",
        resolved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", auditId)

    if (error) {
      console.error("Error resolving audit:", error)
      return false
    }

    return true
  }

  /**
   * Run all diagnostic checks
   */
  async runAllDiagnostics(): Promise<{
    patientsWithoutEncounters: number
    missingDescriptors: number
    communicationAudits: number
  }> {
    const patientsWithoutEncounters =
      await this.detectPatientsWithoutEncounters()
    const missingDescriptors = await this.detectMissingPatientDescriptors()
    const communicationAudits = await this.auditCommunications()

    return {
      patientsWithoutEncounters,
      missingDescriptors,
      communicationAudits,
    }
  }
}

export const diagnosticService = new DiagnosticService()
