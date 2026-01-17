// Edge Function: Generate Weekly Productivity Report
// Runs every Monday at 6 AM

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface WeeklyMetrics {
  totalStaff: number
  avgUtilization: number
  totalAppointments: number
  totalCompleted: number
  totalNoShows: number
  totalRevenue: number
  topPerformers: Array<{
    staff_name: string
    utilization: number
    appointments: number
    revenue: number
  }>
  underutilized: Array<{
    staff_name: string
    utilization: number
    available_slots: number
  }>
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate date range (last 7 days)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 1) // Yesterday
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 6) // 7 days total

    // Get capacity data for the week
    const { data: capacityData, error: capError } = await supabase
      .from('staff_capacity')
      .select(`
        *,
        user_profiles (full_name, role)
      `)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (capError) throw capError

    if (!capacityData || capacityData.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No data available for reporting period'
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    // Aggregate metrics by staff
    const staffMetrics = new Map()
    
    capacityData.forEach((record: any) => {
      const staffId = record.staff_id
      if (!staffMetrics.has(staffId)) {
        staffMetrics.set(staffId, {
          staff_id: staffId,
          staff_name: record.user_profiles?.full_name || 'Unknown',
          total_available: 0,
          total_booked: 0,
          total_completed: 0,
          appointments: 0,
          completed: 0,
          no_shows: 0,
          revenue: 0
        })
      }
      
      const metrics = staffMetrics.get(staffId)
      metrics.total_available += record.total_available_minutes || 0
      metrics.total_booked += record.booked_minutes || 0
      metrics.total_completed += record.completed_minutes || 0
      metrics.appointments += record.appointments_scheduled || 0
      metrics.completed += record.appointments_completed || 0
      metrics.no_shows += record.no_shows || 0
      metrics.revenue += Number(record.revenue_actual) || 0
    })

    // Calculate overall metrics
    const allStaff = Array.from(staffMetrics.values())
    const totalAvailable = allStaff.reduce((sum, s) => sum + s.total_available, 0)
    const totalBooked = allStaff.reduce((sum, s) => sum + s.total_booked, 0)
    
    const metrics: WeeklyMetrics = {
      totalStaff: allStaff.length,
      avgUtilization: totalAvailable > 0 ? (totalBooked / totalAvailable) * 100 : 0,
      totalAppointments: allStaff.reduce((sum, s) => sum + s.appointments, 0),
      totalCompleted: allStaff.reduce((sum, s) => sum + s.completed, 0),
      totalNoShows: allStaff.reduce((sum, s) => sum + s.no_shows, 0),
      totalRevenue: allStaff.reduce((sum, s) => sum + s.revenue, 0),
      topPerformers: allStaff
        .map(s => ({
          staff_name: s.staff_name,
          utilization: s.total_available > 0 ? (s.total_booked / s.total_available) * 100 : 0,
          appointments: s.completed,
          revenue: s.revenue
        }))
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 5),
      underutilized: allStaff
        .map(s => ({
          staff_name: s.staff_name,
          utilization: s.total_available > 0 ? (s.total_booked / s.total_available) * 100 : 0,
          available_slots: Math.floor((s.total_available - s.total_booked) / 30)
        }))
        .filter(s => s.utilization < 75)
        .sort((a, b) => a.utilization - b.utilization)
        .slice(0, 5)
    }

    // Send report to all admins
    const { data: admins } = await supabase
      .from('user_profiles')
      .select('id, email')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (admins) {
      for (const admin of admins) {
        await supabase.from('notifications').insert({
          user_id: admin.id,
          type: 'weekly_report',
          title: 'Weekly Productivity Report',
          message: `Last week: ${metrics.avgUtilization.toFixed(1)}% avg utilization, ${metrics.totalCompleted} appointments completed, $${metrics.totalRevenue.toFixed(2)} revenue`,
          priority: 'medium',
          data: {
            period: {
              start: startDate.toISOString().split('T')[0],
              end: endDate.toISOString().split('T')[0]
            },
            metrics
          }
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      report: metrics,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      notifications_sent: admins?.length || 0
    }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error('Error generating weekly report:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
