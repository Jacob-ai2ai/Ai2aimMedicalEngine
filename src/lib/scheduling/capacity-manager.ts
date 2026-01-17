/**
 * Capacity Manager
 * Manages staff capacity calculation, utilization tracking, and optimization
 */

import { createServerSupabase } from '@/lib/supabase/server'

interface StaffCapacity {
  id: string
  staff_id: string
  date: string
  total_available_minutes: number
  booked_minutes: number
  completed_minutes: number
  blocked_minutes: number
  utilization_percentage: number
  appointments_scheduled: number
  appointments_completed: number
  appointments_cancelled: number
  no_shows: number
  revenue_expected: number
  revenue_actual: number
  last_calculated_at: string
  updated_at: string
}

interface UnderutilizedStaff {
  staff_id: string
  staff_name: string
  role: string
  utilization_percentage: number
  available_minutes: number
  revenue_potential: number
}

export class CapacityManager {
  /**
   * Calculate daily capacity for a staff member
   */
  static async calculateDailyCapacity(
    staffId: string,
    date: Date
  ): Promise<StaffCapacity | null> {
    const supabase = await createServerSupabase()

    // Call the database function to calculate capacity
    const { error } = await supabase.rpc('calculate_staff_capacity', {
      p_staff_id: staffId,
      p_date: date.toISOString().split('T')[0]
    })

    if (error) throw error

    // Fetch the calculated capacity
    const { data, error: fetchError } = await supabase
      .from('staff_capacity')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date.toISOString().split('T')[0])
      .single()

    if (fetchError) throw fetchError

    return data
  }

  /**
   * Update utilization for a staff member (called automatically by triggers)
   */
  static async updateUtilization(
    staffId: string,
    date: Date
  ): Promise<void> {
    await this.calculateDailyCapacity(staffId, date)
  }

  /**
   * Get underutilized staff for a specific date
   */
  static async getUnderutilizedStaff(
    date: Date,
    threshold: number = 75
  ): Promise<UnderutilizedStaff[]> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase.rpc('get_underutilized_staff', {
      p_date: date.toISOString().split('T')[0],
      p_threshold: threshold
    })

    if (error) throw error

    return data || []
  }

  /**
   * Get capacity for multiple staff members over a date range
   */
  static async getCapacityRange(
    staffIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<StaffCapacity[]> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('staff_capacity')
      .select('*')
      .in('staff_id', staffIds)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    return data || []
  }

  /**
   * Optimize schedule for a specific date
   * Identifies gaps and suggests improvements
   */
  static async optimizeSchedule(date: Date): Promise<{
    underutilized: UnderutilizedStaff[]
    suggestions: Array<{
      staffId: string
      staffName: string
      action: string
      impact: string
      priority: number
    }>
  }> {
    const underutilized = await this.getUnderutilizedStaff(date, 75)
    
    const suggestions = underutilized.map(staff => ({
      staffId: staff.staff_id,
      staffName: staff.staff_name,
      action: `Fill ${Math.floor(staff.available_minutes / 30)} appointment slots`,
      impact: `Increase utilization to 100%, potential revenue: $${staff.revenue_potential.toFixed(2)}`,
      priority: staff.utilization_percentage < 50 ? 1 : 2
    }))

    return {
      underutilized,
      suggestions: suggestions.sort((a, b) => a.priority - b.priority)
    }
  }

  /**
   * Get clinic-wide capacity overview
   */
  static async getClinicCapacity(date: Date): Promise<{
    totalStaff: number
    averageUtilization: number
    totalAppointments: number
    totalRevenue: number
    availableCapacity: number
  }> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('staff_capacity')
      .select('*')
      .eq('date', date.toISOString().split('T')[0])

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        totalStaff: 0,
        averageUtilization: 0,
        totalAppointments: 0,
        totalRevenue: 0,
        availableCapacity: 0
      }
    }

    const totalUtilization = data.reduce((sum, c) => sum + (c.utilization_percentage || 0), 0)
    const totalAppointments = data.reduce((sum, c) => sum + (c.appointments_scheduled || 0), 0)
    const totalRevenue = data.reduce((sum, c) => sum + (c.revenue_expected || 0), 0)
    const totalAvailable = data.reduce((sum, c) => sum + (c.total_available_minutes - c.booked_minutes), 0)

    return {
      totalStaff: data.length,
      averageUtilization: totalUtilization / data.length,
      totalAppointments,
      totalRevenue,
      availableCapacity: Math.floor(totalAvailable / 30) // Assuming 30-min slots
    }
  }

  /**
   * Forecast capacity needs based on historical data
   */
  static async forecastCapacity(
    staffId: string,
    futureDays: number = 30
  ): Promise<{
    averageUtilization: number
    predictedDemand: number
    recommendedSlots: number
  }> {
    const supabase = await createServerSupabase()

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Last 30 days

    const { data, error } = await supabase
      .from('staff_capacity')
      .select('*')
      .eq('staff_id', staffId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        averageUtilization: 0,
        predictedDemand: 0,
        recommendedSlots: 0
      }
    }

    const avgUtilization = data.reduce((sum, c) => sum + (c.utilization_percentage || 0), 0) / data.length
    const avgAppointments = data.reduce((sum, c) => sum + (c.appointments_scheduled || 0), 0) / data.length

    return {
      averageUtilization: avgUtilization,
      predictedDemand: Math.round(avgAppointments),
      recommendedSlots: Math.ceil(avgAppointments * 1.1) // 10% buffer
    }
  }

  /**
   * Check if staff member has available capacity
   */
  static async hasCapacity(
    staffId: string,
    date: Date,
    requiredMinutes: number = 30
  ): Promise<boolean> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('staff_capacity')
      .select('total_available_minutes, booked_minutes')
      .eq('staff_id', staffId)
      .eq('date', date.toISOString().split('T')[0])
      .single()

    if (error || !data) return false

    const availableMinutes = data.total_available_minutes - data.booked_minutes
    return availableMinutes >= requiredMinutes
  }

  /**
   * Get capacity alerts for today
   */
  static async getCapacityAlerts(): Promise<Array<{
    type: 'low_utilization' | 'high_utilization' | 'no_shows'
    staffId: string
    staffName: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>> {
    const today = new Date()
    const supabase = await createServerSupabase()

    const { data: capacities } = await supabase
      .from('staff_capacity')
      .select(`
        *,
        user_profiles (full_name)
      `)
      .eq('date', today.toISOString().split('T')[0])

    if (!capacities) return []

    const alerts: Array<{
      type: 'low_utilization' | 'high_utilization' | 'no_shows'
      staffId: string
      staffName: string
      message: string
      severity: 'low' | 'medium' | 'high'
    }> = []

    for (const capacity of capacities) {
      // Low utilization alert
      if (capacity.utilization_percentage < 50) {
        alerts.push({
          type: 'low_utilization',
          staffId: capacity.staff_id,
          staffName: (capacity.user_profiles as any)?.full_name || 'Unknown',
          message: `Only ${capacity.utilization_percentage.toFixed(0)}% utilized with ${Math.floor((capacity.total_available_minutes - capacity.booked_minutes) / 30)} open slots`,
          severity: 'high'
        })
      } else if (capacity.utilization_percentage < 75) {
        alerts.push({
          type: 'low_utilization',
          staffId: capacity.staff_id,
          staffName: (capacity.user_profiles as any)?.full_name || 'Unknown',
          message: `${capacity.utilization_percentage.toFixed(0)}% utilized - could schedule more appointments`,
          severity: 'medium'
        })
      }

      // High no-show rate
      if (capacity.appointments_scheduled > 0) {
        const noShowRate = (capacity.no_shows / capacity.appointments_scheduled) * 100
        if (noShowRate > 15) {
          alerts.push({
            type: 'no_shows',
            staffId: capacity.staff_id,
            staffName: (capacity.user_profiles as any)?.full_name || 'Unknown',
            message: `High no-show rate: ${noShowRate.toFixed(0)}% (${capacity.no_shows} of ${capacity.appointments_scheduled})`,
            severity: 'high'
          })
        }
      }

      // Overbooked (utilization > 100%)
      if (capacity.utilization_percentage > 100) {
        alerts.push({
          type: 'high_utilization',
          staffId: capacity.staff_id,
          staffName: (capacity.user_profiles as any)?.full_name || 'Unknown',
          message: `Overbooked at ${capacity.utilization_percentage.toFixed(0)}% utilization`,
          severity: 'high'
        })
      }
    }

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }
}
