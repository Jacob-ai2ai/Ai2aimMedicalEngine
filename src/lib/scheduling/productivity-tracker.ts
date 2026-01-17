/**
 * Productivity Tracker
 * Tracks and analyzes staff and clinic productivity metrics
 */

import { createServerSupabase } from '@/lib/supabase/server'

interface Period {
  start: Date
  end: Date
}

interface StaffProductivityMetrics {
  staffId: string
  staffName: string
  role: string
  period: Period
  
  // Utilization Metrics
  totalAvailableHours: number
  bookedHours: number
  completedHours: number
  utilizationRate: number
  
  // Appointment Metrics
  appointmentsScheduled: number
  appointmentsCompleted: number
  appointmentsCancelled: number
  noShows: number
  completionRate: number
  noShowRate: number
  
  // Revenue Metrics
  revenueExpected: number
  revenueActual: number
  revenuePerHour: number
  
  // Efficiency Metrics
  avgAppointmentDuration: number
  appointmentsPerDay: number
  avgGapBetweenAppointments: number
}

interface ClinicProductivityMetrics {
  period: Period
  
  // Overall Utilization
  totalStaffHours: number
  totalBookedHours: number
  totalCompletedHours: number
  clinicUtilizationRate: number
  
  // Capacity Management
  totalCapacity: number
  appointmentsBooked: number
  capacityFillRate: number
  
  // Revenue
  totalRevenueExpected: number
  totalRevenueActual: number
  revenuePerStaffMember: number
  
  // Staff Performance
  topPerformers: StaffProductivityMetrics[]
  underutilizedStaff: StaffProductivityMetrics[]
  
  // Trends
  trendingUp: boolean
  weekOverWeekGrowth: number
}

interface Bottleneck {
  type: 'scheduling' | 'capacity' | 'no_shows' | 'cancellations'
  description: string
  impact: string
  recommendation: string
  priority: number
}

export class ProductivityTracker {
  /**
   * Get staff productivity metrics for a period
   */
  static async getStaffMetrics(
    staffId: string,
    period: Period
  ): Promise<StaffProductivityMetrics> {
    const supabase = await createServerSupabase()

    // Get staff info
    const { data: staff } = await supabase
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', staffId)
      .single()

    // Get capacity data for the period
    const { data: capacityData } = await supabase
      .from('staff_capacity')
      .select('*')
      .eq('staff_id', staffId)
      .gte('date', period.start.toISOString().split('T')[0])
      .lte('date', period.end.toISOString().split('T')[0])

    if (!capacityData || capacityData.length === 0) {
      return this.getEmptyStaffMetrics(staffId, staff?.full_name || 'Unknown', staff?.role || 'unknown', period)
    }

    // Aggregate metrics
    const totalAvailableMinutes = capacityData.reduce((sum, c) => sum + (c.total_available_minutes || 0), 0)
    const bookedMinutes = capacityData.reduce((sum, c) => sum + (c.booked_minutes || 0), 0)
    const completedMinutes = capacityData.reduce((sum, c) => sum + (c.completed_minutes || 0), 0)
    const appointmentsScheduled = capacityData.reduce((sum, c) => sum + (c.appointments_scheduled || 0), 0)
    const appointmentsCompleted = capacityData.reduce((sum, c) => sum + (c.appointments_completed || 0), 0)
    const appointmentsCancelled = capacityData.reduce((sum, c) => sum + (c.appointments_cancelled || 0), 0)
    const noShows = capacityData.reduce((sum, c) => sum + (c.no_shows || 0), 0)
    const revenueExpected = capacityData.reduce((sum, c) => sum + (c.revenue_expected || 0), 0)
    const revenueActual = capacityData.reduce((sum, c) => sum + (c.revenue_actual || 0), 0)

    const workingDays = capacityData.filter(c => c.total_available_minutes > 0).length

    return {
      staffId,
      staffName: staff?.full_name || 'Unknown',
      role: staff?.role || 'unknown',
      period,
      
      totalAvailableHours: totalAvailableMinutes / 60,
      bookedHours: bookedMinutes / 60,
      completedHours: completedMinutes / 60,
      utilizationRate: totalAvailableMinutes > 0 ? (bookedMinutes / totalAvailableMinutes) * 100 : 0,
      
      appointmentsScheduled,
      appointmentsCompleted,
      appointmentsCancelled,
      noShows,
      completionRate: appointmentsScheduled > 0 ? (appointmentsCompleted / appointmentsScheduled) * 100 : 0,
      noShowRate: appointmentsScheduled > 0 ? (noShows / appointmentsScheduled) * 100 : 0,
      
      revenueExpected,
      revenueActual,
      revenuePerHour: completedMinutes > 0 ? (revenueActual / (completedMinutes / 60)) : 0,
      
      avgAppointmentDuration: appointmentsCompleted > 0 ? completedMinutes / appointmentsCompleted : 0,
      appointmentsPerDay: workingDays > 0 ? appointmentsScheduled / workingDays : 0,
      avgGapBetweenAppointments: 0 // Would need to calculate from appointment times
    }
  }

  /**
   * Get clinic-wide productivity metrics
   */
  static async getClinicMetrics(period: Period): Promise<ClinicProductivityMetrics> {
    const supabase = await createServerSupabase()

    // Get all staff IDs
    const { data: staffList } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('is_active', true)
      .in('role', ['physician', 'nurse', 'administrative'])

    if (!staffList || staffList.length === 0) {
      throw new Error('No active staff found')
    }

    // Get capacity data for all staff
    const { data: capacityData } = await supabase
      .from('staff_capacity')
      .select('*')
      .in('staff_id', staffList.map(s => s.id))
      .gte('date', period.start.toISOString().split('T')[0])
      .lte('date', period.end.toISOString().split('T')[0])

    if (!capacityData || capacityData.length === 0) {
      throw new Error('No capacity data found for period')
    }

    // Aggregate clinic metrics
    const totalAvailableMinutes = capacityData.reduce((sum, c) => sum + (c.total_available_minutes || 0), 0)
    const bookedMinutes = capacityData.reduce((sum, c) => sum + (c.booked_minutes || 0), 0)
    const completedMinutes = capacityData.reduce((sum, c) => sum + (c.completed_minutes || 0), 0)
    const totalAppointments = capacityData.reduce((sum, c) => sum + (c.appointments_scheduled || 0), 0)
    const revenueExpected = capacityData.reduce((sum, c) => sum + (c.revenue_expected || 0), 0)
    const revenueActual = capacityData.reduce((sum, c) => sum + (c.revenue_actual || 0), 0)

    // Get individual staff metrics for rankings
    const staffMetrics = await Promise.all(
      staffList.map(staff => this.getStaffMetrics(staff.id, period))
    )

    // Sort by utilization
    const sortedByUtilization = [...staffMetrics].sort((a, b) => b.utilizationRate - a.utilizationRate)
    const topPerformers = sortedByUtilization.slice(0, 5)
    const underutilized = sortedByUtilization.filter(s => s.utilizationRate < 75).slice(0, 5)

    // Calculate trends (compare with previous period)
    const previousPeriod = {
      start: new Date(period.start.getTime() - (period.end.getTime() - period.start.getTime())),
      end: period.start
    }

    const previousMetrics = await this.getClinicMetrics(previousPeriod).catch(() => null)
    
    let weekOverWeekGrowth = 0
    if (previousMetrics) {
      weekOverWeekGrowth = ((totalAppointments - previousMetrics.appointmentsBooked) / previousMetrics.appointmentsBooked) * 100
    }

    return {
      period,
      
      totalStaffHours: totalAvailableMinutes / 60,
      totalBookedHours: bookedMinutes / 60,
      totalCompletedHours: completedMinutes / 60,
      clinicUtilizationRate: totalAvailableMinutes > 0 ? (bookedMinutes / totalAvailableMinutes) * 100 : 0,
      
      totalCapacity: Math.floor(totalAvailableMinutes / 30),
      appointmentsBooked: totalAppointments,
      capacityFillRate: totalAvailableMinutes > 0 ? (bookedMinutes / totalAvailableMinutes) * 100 : 0,
      
      totalRevenueExpected: revenueExpected,
      totalRevenueActual: revenueActual,
      revenuePerStaffMember: staffList.length > 0 ? revenueActual / staffList.length : 0,
      
      topPerformers,
      underutilizedStaff: underutilized,
      
      trendingUp: weekOverWeekGrowth > 0,
      weekOverWeekGrowth
    }
  }

  /**
   * Identify bottlenecks in the system
   */
  static async identifyBottlenecks(period: Period): Promise<Bottleneck[]> {
    const clinicMetrics = await this.getClinicMetrics(period)
    const bottlenecks: Bottleneck[] = []

    // Low utilization bottleneck
    if (clinicMetrics.clinicUtilizationRate < 70) {
      bottlenecks.push({
        type: 'capacity',
        description: `Clinic utilization at ${clinicMetrics.clinicUtilizationRate.toFixed(0)}%`,
        impact: `${Math.floor((clinicMetrics.totalStaffHours - clinicMetrics.totalBookedHours) / 0.5)} potential appointments not booked`,
        recommendation: 'Implement auto-fill from waitlist, increase marketing, or adjust staff schedules',
        priority: 1
      })
    }

    // High cancellation rate
    const avgStaff = clinicMetrics.topPerformers[0]
    if (avgStaff && avgStaff.noShowRate > 10) {
      bottlenecks.push({
        type: 'no_shows',
        description: `High no-show rate: ${avgStaff.noShowRate.toFixed(0)}%`,
        impact: 'Lost revenue and wasted capacity',
        recommendation: 'Implement stricter reminder system, require confirmation 24h before, or implement no-show fees',
        priority: 2
      })
    }

    // Underutilized staff
    if (clinicMetrics.underutilizedStaff.length > 0) {
      bottlenecks.push({
        type: 'scheduling',
        description: `${clinicMetrics.underutilizedStaff.length} staff members underutilized`,
        impact: `Potential additional revenue: $${clinicMetrics.underutilizedStaff.reduce((sum, s) => sum + (s.revenueExpected * 0.3), 0).toFixed(2)}`,
        recommendation: 'Redistribute appointments or adjust staff hours',
        priority: 1
      })
    }

    // Negative growth
    if (!clinicMetrics.trendingUp && clinicMetrics.weekOverWeekGrowth < -5) {
      bottlenecks.push({
        type: 'scheduling',
        description: `Appointment volume declining: ${clinicMetrics.weekOverWeekGrowth.toFixed(0)}% decrease`,
        impact: 'Revenue decline and potential staff underutilization',
        recommendation: 'Review marketing efforts, patient satisfaction, and scheduling convenience',
        priority: 1
      })
    }

    return bottlenecks.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Generate productivity report
   */
  static async generateProductivityReport(period: Period): Promise<{
    clinicMetrics: ClinicProductivityMetrics
    staffMetrics: StaffProductivityMetrics[]
    bottlenecks: Bottleneck[]
    recommendations: string[]
  }> {
    const clinicMetrics = await this.getClinicMetrics(period)
    const bottlenecks = await this.identifyBottlenecks(period)
    
    const recommendations: string[] = []

    // Generate recommendations based on data
    if (clinicMetrics.clinicUtilizationRate < 75) {
      recommendations.push('Increase clinic utilization by filling empty slots from waitlist')
    }

    if (clinicMetrics.underutilizedStaff.length > 0) {
      recommendations.push(`Focus on booking appointments for ${clinicMetrics.underutilizedStaff[0].staffName}`)
    }

    if (clinicMetrics.trendingUp) {
      recommendations.push('Positive trend - consider adding staff capacity to meet growing demand')
    } else {
      recommendations.push('Review and improve patient acquisition strategies')
    }

    return {
      clinicMetrics,
      staffMetrics: [...clinicMetrics.topPerformers, ...clinicMetrics.underutilizedStaff],
      bottlenecks,
      recommendations
    }
  }

  /**
   * Get daily productivity summary
   */
  static async getDailySummary(date: Date): Promise<{
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    noShows: number
    utilizationRate: number
    revenue: number
    alerts: Array<{ message: string; severity: string }>
  }> {
    const supabase = await createServerSupabase()

    const { data: capacityData } = await supabase
      .from('staff_capacity')
      .select('*')
      .eq('date', date.toISOString().split('T')[0])

    if (!capacityData || capacityData.length === 0) {
      return {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShows: 0,
        utilizationRate: 0,
        revenue: 0,
        alerts: []
      }
    }

    const totalAppointments = capacityData.reduce((sum, c) => sum + (c.appointments_scheduled || 0), 0)
    const completed = capacityData.reduce((sum, c) => sum + (c.appointments_completed || 0), 0)
    const cancelled = capacityData.reduce((sum, c) => sum + (c.appointments_cancelled || 0), 0)
    const noShows = capacityData.reduce((sum, c) => sum + (c.no_shows || 0), 0)
    const totalAvailable = capacityData.reduce((sum, c) => sum + (c.total_available_minutes || 0), 0)
    const booked = capacityData.reduce((sum, c) => sum + (c.booked_minutes || 0), 0)
    const revenue = capacityData.reduce((sum, c) => sum + (c.revenue_actual || 0), 0)

    const alerts: Array<{ message: string; severity: string }> = []
    
    const utilizationRate = totalAvailable > 0 ? (booked / totalAvailable) * 100 : 0
    
    if (utilizationRate < 60) {
      alerts.push({ message: 'Low utilization - many empty slots available', severity: 'high' })
    }

    if (noShows > totalAppointments * 0.1) {
      alerts.push({ message: 'High no-show rate today', severity: 'medium' })
    }

    return {
      totalAppointments,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      noShows,
      utilizationRate,
      revenue,
      alerts
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private static getEmptyStaffMetrics(
    staffId: string,
    staffName: string,
    role: string,
    period: Period
  ): StaffProductivityMetrics {
    return {
      staffId,
      staffName,
      role,
      period,
      totalAvailableHours: 0,
      bookedHours: 0,
      completedHours: 0,
      utilizationRate: 0,
      appointmentsScheduled: 0,
      appointmentsCompleted: 0,
      appointmentsCancelled: 0,
      noShows: 0,
      completionRate: 0,
      noShowRate: 0,
      revenueExpected: 0,
      revenueActual: 0,
      revenuePerHour: 0,
      avgAppointmentDuration: 0,
      appointmentsPerDay: 0,
      avgGapBetweenAppointments: 0
    }
  }
}
