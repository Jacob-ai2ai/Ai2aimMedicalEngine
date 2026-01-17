/**
 * Calendar Management API
 * GET /api/calendar - Get calendar view with appointments and capacity
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Get parameters
    const view = searchParams.get('view') || 'week' // 'day', 'week', 'month'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const staffId = searchParams.get('staffId') // Optional filter by staff
    
    // Calculate date range based on view
    const startDate = new Date(date)
    let endDate = new Date(date)
    
    switch (view) {
      case 'day':
        // Same day
        break
      case 'week':
        // Start of week to end of week
        startDate.setDate(startDate.getDate() - startDate.getDay())
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'month':
        // First day to last day of month
        startDate.setDate(1)
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        break
    }

    // Build appointments query
    let appointmentsQuery = supabase
      .from('appointments')
      .select(`
        *,
        patients (id, first_name, last_name, phone),
        user_profiles!appointments_staff_id_fkey (id, full_name, role),
        appointment_types (type_code, name, color_code, default_duration)
      `)
      .gte('appointment_date', startDate.toISOString().split('T')[0])
      .lte('appointment_date', endDate.toISOString().split('T')[0])
      .in('status', ['scheduled', 'confirmed', 'checked_in', 'in_progress'])
    
    if (staffId) {
      appointmentsQuery = appointmentsQuery.eq('staff_id', staffId)
    }

    const { data: appointments, error: apptError } = await appointmentsQuery
      .order('appointment_date')
      .order('start_time')

    if (apptError) throw apptError

    // Get staff capacity for the period
    let capacityQuery = supabase
      .from('staff_capacity')
      .select(`
        *,
        user_profiles (id, full_name, role)
      `)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
    
    if (staffId) {
      capacityQuery = capacityQuery.eq('staff_id', staffId)
    }

    const { data: capacity, error: capError } = await capacityQuery
      .order('date')

    if (capError) throw capError

    // Get staff schedules
    let staffQuery = supabase
      .from('staff_schedules')
      .select(`
        *,
        user_profiles (id, full_name, role)
      `)
      .eq('is_active', true)
    
    if (staffId) {
      staffQuery = staffQuery.eq('staff_id', staffId)
    }

    const { data: schedules, error: schedError } = await staffQuery

    if (schedError) throw schedError

    // Get time off periods
    let timeOffQuery = supabase
      .from('staff_time_off')
      .select(`
        *,
        user_profiles (id, full_name)
      `)
      .eq('is_approved', true)
      .or(`start_date.lte.${endDate.toISOString().split('T')[0]},end_date.gte.${startDate.toISOString().split('T')[0]}`)
    
    if (staffId) {
      timeOffQuery = timeOffQuery.eq('staff_id', staffId)
    }

    const { data: timeOff, error: timeOffError } = await timeOffQuery

    if (timeOffError) throw timeOffError

    // Calculate summary stats
    const summary = {
      totalAppointments: appointments?.length || 0,
      averageUtilization: capacity && capacity.length > 0
        ? capacity.reduce((sum, c) => sum + Number(c.utilization_percentage), 0) / capacity.length
        : 0,
      totalRevenue: capacity?.reduce((sum, c) => sum + Number(c.revenue_expected), 0) || 0,
      staffCount: schedules?.filter((s, i, arr) => 
        arr.findIndex(x => x.staff_id === s.staff_id) === i
      ).length || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        appointments: appointments || [],
        capacity: capacity || [],
        schedules: schedules || [],
        timeOff: timeOff || [],
        summary
      },
      meta: {
        view,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        staffId: staffId || 'all'
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
