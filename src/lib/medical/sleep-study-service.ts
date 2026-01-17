import { createServerSupabase } from "@/lib/supabase/server"

export interface SleepStudy {
  id: string
  patient_id: string
  study_type: "level3_home" | "level1_psg" | "level2_home"
  study_date?: string
  ordered_by?: string
  monitor_serial_number?: string
  status: "ordered" | "dispatched" | "in_progress" | "completed" | "interpreted"
  dispatch_date?: string
  return_date?: string
  interpretation_date?: string
  interpreted_by?: string
  results?: any // JSONB
  diagnosis?: string
  recommendations?: string
  created_at: string
  updated_at: string
}

export interface Monitor {
  id: string
  serial_number: string
  equipment_id: string
  status: string
  equipment?: {
    name: string
    model?: string
  }
}

export class SleepStudyService {
  /**
   * Create a new sleep study
   */
  async createSleepStudy(
    patientId: string,
    studyType: "level3_home" | "level1_psg" | "level2_home",
    orderedBy: string,
    studyDate?: string
  ): Promise<SleepStudy | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("sleep_studies")
      .insert({
        patient_id: patientId,
        study_type: studyType,
        study_date: studyDate || new Date().toISOString().split("T")[0],
        ordered_by: orderedBy,
        status: "ordered",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating sleep study:", error)
      return null
    }

    return data
  }

  /**
   * Get sleep study by ID
   */
  async getSleepStudy(studyId: string): Promise<SleepStudy | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("sleep_studies")
      .select("*")
      .eq("id", studyId)
      .single()

    if (error) {
      console.error("Error fetching sleep study:", error)
      return null
    }

    return data
  }

  /**
   * Get sleep studies for a patient
   */
  async getPatientSleepStudies(patientId: string): Promise<SleepStudy[]> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("sleep_studies")
      .select("*")
      .eq("patient_id", patientId)
      .order("study_date", { ascending: false })

    if (error) {
      console.error("Error fetching patient sleep studies:", error)
      return []
    }

    return data || []
  }

  /**
   * Get available monitors (Level 3 devices)
   */
  async getAvailableMonitors(): Promise<Monitor[]> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_inventory")
      .select(`
        id,
        serial_number,
        equipment_id,
        status,
        equipment:dme_equipment_id (
          name,
          model
        )
      `)
      .eq("status", "available")
      .eq("equipment.category", "monitor")

    if (error) {
      console.error("Error fetching available monitors:", error)
      return []
    }

    if (!data) {
      return []
    }

    return data.map((item: any) => ({
      id: item.id,
      serial_number: item.serial_number || "",
      equipment_id: item.equipment_id,
      status: item.status,
      equipment: item.equipment,
    }))
  }

  /**
   * Dispatch monitor for sleep study
   */
  async dispatchMonitor(
    studyId: string,
    monitorSerial: string
  ): Promise<boolean> {
    const supabase = await createServerSupabase()
    
    // Update sleep study
    const { error: studyError } = await supabase
      .from("sleep_studies")
      .update({
        monitor_serial_number: monitorSerial,
        status: "dispatched",
        dispatch_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", studyId)

    if (studyError) {
      console.error("Error updating sleep study:", studyError)
      return false
    }

    // Update monitor inventory status to assigned
    const { error: inventoryError } = await supabase
      .from("dme_inventory")
      .update({
        status: "assigned",
      })
      .eq("serial_number", monitorSerial)

    if (inventoryError) {
      console.error("Error updating monitor inventory:", inventoryError)
      // Don't fail the whole operation, but log the error
    }

    return true
  }

  /**
   * Record monitor return
   */
  async recordReturn(studyId: string, returnDate?: string): Promise<boolean> {
    const study = await this.getSleepStudy(studyId)
    if (!study) {
      return false
    }

    const supabase = await createServerSupabase()
    const returnDateStr = returnDate || new Date().toISOString().split("T")[0]

    // Update sleep study
    const { error: studyError } = await supabase
      .from("sleep_studies")
      .update({
        status: "completed",
        return_date: returnDateStr,
      })
      .eq("id", studyId)

    if (studyError) {
      console.error("Error updating sleep study return:", studyError)
      return false
    }

    // Return monitor to available status if serial number exists
    if (study.monitor_serial_number) {
      const { error: inventoryError } = await supabase
        .from("dme_inventory")
        .update({
          status: "available",
          assigned_to_patient_id: null,
          assigned_at: null,
        })
        .eq("serial_number", study.monitor_serial_number)

      if (inventoryError) {
        console.error("Error returning monitor:", inventoryError)
        // Don't fail the whole operation
      }
    }

    return true
  }

  /**
   * Upload study results
   */
  async uploadResults(studyId: string, results: any): Promise<boolean> {
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from("sleep_studies")
      .update({
        results: results,
        status: "completed",
      })
      .eq("id", studyId)

    if (error) {
      console.error("Error uploading results:", error)
      return false
    }

    return true
  }

  /**
   * Interpret study (physician review)
   */
  async interpretStudy(
    studyId: string,
    physicianId: string,
    diagnosis: string,
    recommendations?: string
  ): Promise<boolean> {
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from("sleep_studies")
      .update({
        interpreted_by: physicianId,
        interpretation_date: new Date().toISOString().split("T")[0],
        diagnosis: diagnosis,
        recommendations: recommendations || null,
        status: "interpreted",
      })
      .eq("id", studyId)

    if (error) {
      console.error("Error interpreting study:", error)
      return false
    }

    return true
  }

  /**
   * Check monitor integrity (via Diagnostic IQ)
   */
  async checkMonitorIntegrity(serialNumber: string): Promise<boolean> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("dme_inventory")
      .select("id, status, next_maintenance_date")
      .eq("serial_number", serialNumber)
      .single()

    if (error || !data) {
      return false
    }

    // Check if maintenance is overdue
    if (data.next_maintenance_date) {
      const maintenanceDate = new Date(data.next_maintenance_date)
      const today = new Date()
      if (maintenanceDate < today) {
        return false // Maintenance overdue
      }
    }

    return data.status === "available" || data.status === "assigned"
  }

  /**
   * Get pending studies (ordered or dispatched)
   */
  async getPendingStudies(limit: number = 50): Promise<SleepStudy[]> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("sleep_studies")
      .select("*")
      .in("status", ["ordered", "dispatched", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching pending studies:", error)
      return []
    }

    return data || []
  }
}

export const sleepStudyService = new SleepStudyService()
