import { createServiceRoleClient } from "@/lib/supabase/client"

export interface RevenueMetrics {
  revenuePulse: number
  ar0_30: number
  ar31_60: number
  ar61_90: number
  ar91Plus: number
  clinicalBlockersCount: number
}

export interface ClinicalBlocker {
  id: string
  patient_id: string
  encounter_date: string
  encounter_type?: string
  billing_status: string
  patient: {
    first_name: string
    last_name: string
    patient_id: string
  }
}

export class RevenueService {
  private supabase = createServiceRoleClient()

  /**
   * Calculate daily revenue pulse from billed encounters
   * FR-014.2
   */
  async calculateDailyRevenuePulse(date: Date = new Date()): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // In a real implementation, this would query billing/claims data
    // For now, we'll use a placeholder calculation based on encounters
    // This assumes each encounter has an associated billing amount
    const { data: encounters } = await this.supabase
      .from("encounters")
      .select("id")
      .eq("billing_status", "billed")
      .gte("encounter_date", startOfDay.toISOString())
      .lte("encounter_date", endOfDay.toISOString())

    // Placeholder: assume average encounter value
    // In production, this would come from actual billing records
    const averageEncounterValue = 250 // This should come from billing data
    return (encounters?.length || 0) * averageEncounterValue
  }

  /**
   * Calculate AR aging buckets
   * FR-014.1
   */
  async calculateARAging(): Promise<{
    ar0_30: number
    ar31_60: number
    ar61_90: number
    ar91Plus: number
  }> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // In a real implementation, this would query actual AR/claims data
    // For now, we'll use encounters as a proxy
    // This is a placeholder - actual AR would come from billing system

    const { data: allEncounters } = await this.supabase
      .from("encounters")
      .select("encounter_date, billing_status")
      .in("billing_status", ["billed", "unbilled"])

    if (!allEncounters) {
      return {
        ar0_30: 0,
        ar31_60: 0,
        ar61_90: 0,
        ar91Plus: 0,
      }
    }

    let ar0_30 = 0
    let ar31_60 = 0
    let ar61_90 = 0
    let ar91Plus = 0

    const averageEncounterValue = 250 // Placeholder

    for (const encounter of allEncounters) {
      const encounterDate = new Date(encounter.encounter_date)
      const daysAgo = Math.floor(
        (now.getTime() - encounterDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (encounter.billing_status === "billed") {
        if (daysAgo <= 30) {
          ar0_30 += averageEncounterValue
        } else if (daysAgo <= 60) {
          ar31_60 += averageEncounterValue
        } else if (daysAgo <= 90) {
          ar61_90 += averageEncounterValue
        } else {
          ar91Plus += averageEncounterValue
        }
      }
    }

    return {
      ar0_30,
      ar31_60,
      ar61_90,
      ar91Plus,
    }
  }

  /**
   * Get clinical blockers (unbilled encounters)
   * FR-014.3
   */
  async getClinicalBlockers(limit: number = 50): Promise<ClinicalBlocker[]> {
    const { data: encounters, error } = await this.supabase
      .from("encounters")
      .select(
        `
        id,
        patient_id,
        encounter_date,
        encounter_type,
        billing_status,
        patients:patient_id (
          first_name,
          last_name,
          patient_id
        )
      `
      )
      .eq("billing_status", "unbilled")
      .order("encounter_date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching clinical blockers:", error)
      return []
    }

    if (!encounters) {
      return []
    }

    return encounters.map((enc: any) => ({
      id: enc.id,
      patient_id: enc.patient_id,
      encounter_date: enc.encounter_date,
      encounter_type: enc.encounter_type,
      billing_status: enc.billing_status,
      patient: enc.patients,
    }))
  }

  /**
   * Get count of clinical blockers
   */
  async getClinicalBlockersCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from("encounters")
      .select("*", { count: "exact", head: true })
      .eq("billing_status", "unbilled")

    if (error) {
      console.error("Error counting clinical blockers:", error)
      return 0
    }

    return count || 0
  }

  /**
   * Update financial metrics table with current data
   * This should be called daily (via cron job or scheduled task)
   */
  async updateFinancialMetrics(): Promise<void> {
    const today = new Date().toISOString().split("T")[0]
    const revenuePulse = await this.calculateDailyRevenuePulse()
    const arAging = await this.calculateARAging()
    const blockersCount = await this.getClinicalBlockersCount()

    // Check if metrics exist for today
    const { data: existing } = await this.supabase
      .from("financial_metrics")
      .select("id")
      .eq("metric_date", today)
      .single()

    if (existing) {
      // Update existing record
      await this.supabase
        .from("financial_metrics")
        .update({
          revenue_pulse: revenuePulse,
          ar_0_30: arAging.ar0_30,
          ar_31_60: arAging.ar31_60,
          ar_61_90: arAging.ar61_90,
          ar_91_plus: arAging.ar91Plus,
          clinical_blockers_count: blockersCount,
        })
        .eq("id", existing.id)
    } else {
      // Create new record
      await this.supabase.from("financial_metrics").insert({
        metric_date: today,
        revenue_pulse: revenuePulse,
        ar_0_30: arAging.ar0_30,
        ar_31_60: arAging.ar31_60,
        ar_61_90: arAging.ar61_90,
        ar_91_plus: arAging.ar91Plus,
        clinical_blockers_count: blockersCount,
      })
    }
  }

  /**
   * Get current financial metrics
   */
  async getFinancialMetrics(): Promise<RevenueMetrics | null> {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await this.supabase
      .from("financial_metrics")
      .select("*")
      .eq("metric_date", today)
      .single()

    if (error || !data) {
      // If no metrics for today, calculate on the fly
      const revenuePulse = await this.calculateDailyRevenuePulse()
      const arAging = await this.calculateARAging()
      const blockersCount = await this.getClinicalBlockersCount()

      return {
        revenuePulse,
        ar0_30: arAging.ar0_30,
        ar31_60: arAging.ar31_60,
        ar61_90: arAging.ar61_90,
        ar91Plus: arAging.ar91Plus,
        clinicalBlockersCount: blockersCount,
      }
    }

    return {
      revenuePulse: Number(data.revenue_pulse) || 0,
      ar0_30: Number(data.ar_0_30) || 0,
      ar31_60: Number(data.ar_31_60) || 0,
      ar61_90: Number(data.ar_61_90) || 0,
      ar91Plus: Number(data.ar_91_plus) || 0,
      clinicalBlockersCount: data.clinical_blockers_count || 0,
    }
  }
}

export const revenueService = new RevenueService()
