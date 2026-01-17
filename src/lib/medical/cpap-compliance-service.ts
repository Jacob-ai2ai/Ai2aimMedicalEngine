import { createServerSupabase } from "@/lib/supabase/server"

export interface ComplianceData {
  days_used: number
  days_required: number
  average_hours_per_night: number
  compliance_percentage: number
  meets_insurance_requirements: boolean
}

export interface ComplianceReport {
  patient_id: string
  period_start: string
  period_end: string
  compliance_data: ComplianceData
  daily_usage: Array<{
    date: string
    hours: number
    used: boolean
  }>
}

export interface ComplianceStatus {
  current_period: ComplianceData
  last_30_days: ComplianceData
  last_90_days: ComplianceData
  meets_requirements: boolean
  warnings: string[]
}

export interface DateRange {
  start: Date
  end: Date
}

export class CPAPComplianceService {
  /**
   * Calculate monthly compliance for a patient
   */
  async calculateMonthlyCompliance(
    patientId: string,
    month: Date
  ): Promise<ComplianceReport | null> {
    const supabase = await createServerSupabase()
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from("cpap_compliance")
      .select("*")
      .eq("patient_id", patientId)
      .gte("compliance_period_start", startOfMonth.toISOString().split("T")[0])
      .lte("compliance_period_end", endOfMonth.toISOString().split("T")[0])
      .single()

    if (error || !data) {
      // If no compliance record exists, return null
      return null
    }

    // Parse raw_data for daily usage if available
    const dailyUsage: Array<{ date: string; hours: number; used: boolean }> = []
    if (data.raw_data && typeof data.raw_data === "object") {
      const raw = data.raw_data as any
      if (raw.daily_usage && Array.isArray(raw.daily_usage)) {
        dailyUsage.push(...raw.daily_usage)
      }
    }

    return {
      patient_id: patientId,
      period_start: data.compliance_period_start,
      period_end: data.compliance_period_end,
      compliance_data: {
        days_used: data.days_used,
        days_required: data.days_required,
        average_hours_per_night: Number(data.average_hours_per_night) || 0,
        compliance_percentage: Number(data.compliance_percentage) || 0,
        meets_insurance_requirements: data.meets_insurance_requirements,
      },
      daily_usage: dailyUsage,
    }
  }

  /**
   * Check insurance compliance requirements
   */
  async checkInsuranceCompliance(
    patientId: string
  ): Promise<ComplianceStatus> {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Get current period (last 30 days)
    const currentPeriod = await this.calculateMonthlyCompliance(patientId, now)
    const last30DaysPeriod = await this.calculateMonthlyCompliance(
      patientId,
      last30Days
    )
    const last90DaysPeriod = await this.calculateMonthlyCompliance(
      patientId,
      last90Days
    )

    const warnings: string[] = []

    // Check current period
    const currentData: ComplianceData = currentPeriod?.compliance_data || {
      days_used: 0,
      days_required: 21,
      average_hours_per_night: 0,
      compliance_percentage: 0,
      meets_insurance_requirements: false,
    }

    if (currentData.days_used < 21) {
      warnings.push(
        `Patient has only used CPAP ${currentData.days_used} of 21 required days this period`
      )
    }

    if (currentData.average_hours_per_night < 4.0) {
      warnings.push(
        `Average usage is ${currentData.average_hours_per_night.toFixed(
          1
        )} hours/night, below 4.0 hour requirement`
      )
    }

    const last30Data: ComplianceData = last30DaysPeriod?.compliance_data || {
      days_used: 0,
      days_required: 21,
      average_hours_per_night: 0,
      compliance_percentage: 0,
      meets_insurance_requirements: false,
    }

    const last90Data: ComplianceData = last90DaysPeriod?.compliance_data || {
      days_used: 0,
      days_required: 21,
      average_hours_per_night: 0,
      compliance_percentage: 0,
      meets_insurance_requirements: false,
    }

    const meetsRequirements =
      currentData.meets_insurance_requirements &&
      currentData.days_used >= 21 &&
      currentData.average_hours_per_night >= 4.0

    return {
      current_period: currentData,
      last_30_days: last30Data,
      last_90_days: last90Data,
      meets_requirements: meetsRequirements,
      warnings,
    }
  }

  /**
   * Create or update compliance record
   */
  async updateCompliance(
    patientId: string,
    periodStart: string,
    periodEnd: string,
    daysUsed: number,
    averageHours: number,
    dataSource: string = "manual",
    rawData?: any
  ): Promise<boolean> {
    const supabase = await createServerSupabase()
    const daysRequired = 21 // Standard insurance requirement
    const totalDays = Math.ceil(
      (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const compliancePercentage = (daysUsed / totalDays) * 100
    const meetsRequirements = daysUsed >= daysRequired && averageHours >= 4.0

    // Check if record exists
    const { data: existing } = await supabase
      .from("cpap_compliance")
      .select("id")
      .eq("patient_id", patientId)
      .eq("compliance_period_start", periodStart)
      .eq("compliance_period_end", periodEnd)
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("cpap_compliance")
        .update({
          days_used: daysUsed,
          average_hours_per_night: averageHours,
          compliance_percentage: compliancePercentage,
          meets_insurance_requirements: meetsRequirements,
          data_source: dataSource,
          raw_data: rawData || null,
        })
        .eq("id", existing.id)

      if (error) {
        console.error("Error updating compliance:", error)
        return false
      }
    } else {
      // Create new
      const { error } = await supabase.from("cpap_compliance").insert({
        patient_id: patientId,
        compliance_period_start: periodStart,
        compliance_period_end: periodEnd,
        days_used: daysUsed,
        days_required: daysRequired,
        average_hours_per_night: averageHours,
        compliance_percentage: compliancePercentage,
        meets_insurance_requirements: meetsRequirements,
        data_source: dataSource,
        raw_data: rawData || null,
      })

      if (error) {
        console.error("Error creating compliance:", error)
        return false
      }
    }

    return true
  }

  /**
   * Import ResMed Cloud data
   */
  async importResMedData(patientId: string, data: any): Promise<boolean> {
    // Parse ResMed data format
    // Expected format: { daily_usage: [{ date, hours }, ...], period_start, period_end }
    const periodStart = data.period_start || new Date().toISOString().split("T")[0]
    const periodEnd = data.period_end || new Date().toISOString().split("T")[0]

    const dailyUsage = data.daily_usage || []
    const daysUsed = dailyUsage.filter((d: any) => d.hours >= 4.0).length
    const totalHours = dailyUsage.reduce((sum: number, d: any) => sum + (d.hours || 0), 0)
    const averageHours = dailyUsage.length > 0 ? totalHours / dailyUsage.length : 0

    return this.updateCompliance(
      patientId,
      periodStart,
      periodEnd,
      daysUsed,
      averageHours,
      "resmed_cloud",
      data
    )
  }

  /**
   * Import Philips Care data
   */
  async importPhilipsData(patientId: string, data: any): Promise<boolean> {
    // Parse Philips data format
    const periodStart = data.period_start || new Date().toISOString().split("T")[0]
    const periodEnd = data.period_end || new Date().toISOString().split("T")[0]

    const dailyUsage = data.daily_usage || []
    const daysUsed = dailyUsage.filter((d: any) => d.hours >= 4.0).length
    const totalHours = dailyUsage.reduce((sum: number, d: any) => sum + (d.hours || 0), 0)
    const averageHours = dailyUsage.length > 0 ? totalHours / dailyUsage.length : 0

    return this.updateCompliance(
      patientId,
      periodStart,
      periodEnd,
      daysUsed,
      averageHours,
      "philips_care",
      data
    )
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    patientId: string,
    period: DateRange
  ): Promise<ComplianceReport | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("cpap_compliance")
      .select("*")
      .eq("patient_id", patientId)
      .gte("compliance_period_start", period.start.toISOString().split("T")[0])
      .lte("compliance_period_end", period.end.toISOString().split("T")[0])
      .order("compliance_period_start", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    const dailyUsage: Array<{ date: string; hours: number; used: boolean }> = []
    if (data.raw_data && typeof data.raw_data === "object") {
      const raw = data.raw_data as any
      if (raw.daily_usage && Array.isArray(raw.daily_usage)) {
        dailyUsage.push(...raw.daily_usage)
      }
    }

    return {
      patient_id: patientId,
      period_start: data.compliance_period_start,
      period_end: data.compliance_period_end,
      compliance_data: {
        days_used: data.days_used,
        days_required: data.days_required,
        average_hours_per_night: Number(data.average_hours_per_night) || 0,
        compliance_percentage: Number(data.compliance_percentage) || 0,
        meets_insurance_requirements: data.meets_insurance_requirements,
      },
      daily_usage: dailyUsage,
    }
  }

  /**
   * Get non-compliant patients
   */
  async getNonCompliantPatients(
    daysThreshold: number = 21
  ): Promise<Array<{ patient_id: string; compliance_data: ComplianceData }>> {
    const supabase = await createServerSupabase()
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from("cpap_compliance")
      .select("patient_id, days_used, days_required, average_hours_per_night, compliance_percentage, meets_insurance_requirements")
      .gte("compliance_period_start", thirtyDaysAgo.toISOString().split("T")[0])
      .or(`days_used.lt.${daysThreshold},average_hours_per_night.lt.4.0,meets_insurance_requirements.eq.false`)

    if (error) {
      console.error("Error fetching non-compliant patients:", error)
      return []
    }

    if (!data) {
      return []
    }

    return data.map((item: any) => ({
      patient_id: item.patient_id,
      compliance_data: {
        days_used: item.days_used,
        days_required: item.days_required,
        average_hours_per_night: Number(item.average_hours_per_night) || 0,
        compliance_percentage: Number(item.compliance_percentage) || 0,
        meets_insurance_requirements: item.meets_insurance_requirements,
      },
    }))
  }

  /**
   * Get compliance history for patient
   */
  async getComplianceHistory(
    patientId: string,
    limit: number = 12
  ): Promise<ComplianceReport[]> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("cpap_compliance")
      .select("*")
      .eq("patient_id", patientId)
      .order("compliance_period_start", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching compliance history:", error)
      return []
    }

    if (!data) {
      return []
    }

    return data.map((item: any) => {
      const dailyUsage: Array<{ date: string; hours: number; used: boolean }> = []
      if (item.raw_data && typeof item.raw_data === "object") {
        const raw = item.raw_data as any
        if (raw.daily_usage && Array.isArray(raw.daily_usage)) {
          dailyUsage.push(...raw.daily_usage)
        }
      }

      return {
        patient_id: patientId,
        period_start: item.compliance_period_start,
        period_end: item.compliance_period_end,
        compliance_data: {
          days_used: item.days_used,
          days_required: item.days_required,
          average_hours_per_night: Number(item.average_hours_per_night) || 0,
          compliance_percentage: Number(item.compliance_percentage) || 0,
          meets_insurance_requirements: item.meets_insurance_requirements,
        },
        daily_usage: dailyUsage,
      }
    })
  }
}

export const cpapComplianceService = new CPAPComplianceService()
