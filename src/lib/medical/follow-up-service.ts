import { createServiceRoleClient } from "@/lib/supabase/client"

export interface FollowUp {
  id: string
  patient_id: string
  encounter_id: string | null
  follow_up_type: "72h" | "3m" | "6m"
  due_date: string
  status: "pending" | "completed" | "overdue" | "cancelled"
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PendingFollowUp extends FollowUp {
  patient: {
    id: string
    first_name: string
    last_name: string
    patient_id: string
    phone?: string
  }
  encounter?: {
    id: string
    encounter_date: string
    encounter_type?: string
  }
  daysOverdue?: number
}

export class FollowUpService {
  private supabase = createServiceRoleClient()

  /**
   * Scan encounters and create follow-up records for patients requiring interventions
   * FR-013.1, FR-013.2, FR-013.3
   */
  async scanAndCreateFollowUps(): Promise<number> {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)

    let createdCount = 0

    // Find encounters needing 72-hour follow-ups
    const { data: encounters72h } = await this.supabase
      .from("encounters")
      .select("id, patient_id, encounter_date")
      .lte("encounter_date", threeDaysAgo.toISOString())
      .order("encounter_date", { ascending: false })

    if (encounters72h) {
      for (const encounter of encounters72h) {
        const dueDate = new Date(encounter.encounter_date)
        dueDate.setDate(dueDate.getDate() + 3)

        // Check if follow-up already exists
        const { data: existing } = await this.supabase
          .from("follow_ups")
          .select("id")
          .eq("encounter_id", encounter.id)
          .eq("follow_up_type", "72h")
          .single()

        if (!existing) {
          await this.supabase.from("follow_ups").insert({
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            follow_up_type: "72h",
            due_date: dueDate.toISOString().split("T")[0],
            status: "pending",
          })
          createdCount++
        }
      }
    }

    // Find encounters needing 3-month follow-ups
    const { data: encounters3m } = await this.supabase
      .from("encounters")
      .select("id, patient_id, encounter_date")
      .lte("encounter_date", threeMonthsAgo.toISOString())
      .order("encounter_date", { ascending: false })

    if (encounters3m) {
      for (const encounter of encounters3m) {
        const dueDate = new Date(encounter.encounter_date)
        dueDate.setDate(dueDate.getDate() + 90)

        // Check if follow-up already exists
        const { data: existing } = await this.supabase
          .from("follow_ups")
          .select("id")
          .eq("encounter_id", encounter.id)
          .eq("follow_up_type", "3m")
          .single()

        if (!existing) {
          await this.supabase.from("follow_ups").insert({
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            follow_up_type: "3m",
            due_date: dueDate.toISOString().split("T")[0],
            status: "pending",
          })
          createdCount++
        }
      }
    }

    // Find encounters needing 6-month follow-ups
    const { data: encounters6m } = await this.supabase
      .from("encounters")
      .select("id, patient_id, encounter_date")
      .lte("encounter_date", sixMonthsAgo.toISOString())
      .order("encounter_date", { ascending: false })

    if (encounters6m) {
      for (const encounter of encounters6m) {
        const dueDate = new Date(encounter.encounter_date)
        dueDate.setDate(dueDate.getDate() + 180)

        // Check if follow-up already exists
        const { data: existing } = await this.supabase
          .from("follow_ups")
          .select("id")
          .eq("encounter_id", encounter.id)
          .eq("follow_up_type", "6m")
          .single()

        if (!existing) {
          await this.supabase.from("follow_ups").insert({
            patient_id: encounter.patient_id,
            encounter_id: encounter.id,
            follow_up_type: "6m",
            due_date: dueDate.toISOString().split("T")[0],
            status: "pending",
          })
          createdCount++
        }
      }
    }

    // Update overdue status
    await this.updateOverdueStatus()

    return createdCount
  }

  /**
   * Update follow-ups that are past their due date to "overdue" status
   */
  async updateOverdueStatus(): Promise<void> {
    const today = new Date().toISOString().split("T")[0]

    await this.supabase
      .from("follow_ups")
      .update({ status: "overdue" })
      .eq("status", "pending")
      .lt("due_date", today)
  }

  /**
   * Get pending follow-ups with patient information
   * FR-013.4
   */
  async getPendingFollowUps(limit: number = 50): Promise<PendingFollowUp[]> {
    const today = new Date().toISOString().split("T")[0]

    const { data: followUps, error } = await this.supabase
      .from("follow_ups")
      .select(
        `
        *,
        patients:patient_id (
          id,
          first_name,
          last_name,
          patient_id,
          phone
        ),
        encounters:encounter_id (
          id,
          encounter_date,
          encounter_type
        )
      `
      )
      .eq("status", "pending")
      .lte("due_date", today)
      .order("due_date", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching pending follow-ups:", error)
      return []
    }

    if (!followUps) {
      return []
    }

    // Calculate days overdue
    return followUps.map((fu: any) => {
      const dueDate = new Date(fu.due_date)
      const todayDate = new Date(today)
      const daysOverdue = Math.floor(
        (todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        ...fu,
        patient: fu.patients,
        encounter: fu.encounters,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
      }
    })
  }

  /**
   * Get follow-ups for a specific patient
   */
  async getPatientFollowUps(patientId: string): Promise<FollowUp[]> {
    const { data, error } = await this.supabase
      .from("follow_ups")
      .select("*")
      .eq("patient_id", patientId)
      .order("due_date", { ascending: true })

    if (error) {
      console.error("Error fetching patient follow-ups:", error)
      return []
    }

    return data || []
  }

  /**
   * Mark a follow-up as completed
   */
  async completeFollowUp(
    followUpId: string,
    notes?: string
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from("follow_ups")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", followUpId)

    if (error) {
      console.error("Error completing follow-up:", error)
      return false
    }

    return true
  }

  /**
   * Create a manual follow-up record
   */
  async createFollowUp(
    patientId: string,
    followUpType: "72h" | "3m" | "6m",
    dueDate: string,
    encounterId?: string,
    createdBy?: string
  ): Promise<FollowUp | null> {
    const { data, error } = await this.supabase
      .from("follow_ups")
      .insert({
        patient_id: patientId,
        encounter_id: encounterId || null,
        follow_up_type: followUpType,
        due_date: dueDate,
        status: "pending",
        created_by: createdBy || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating follow-up:", error)
      return null
    }

    return data
  }
}

export const followUpService = new FollowUpService()
