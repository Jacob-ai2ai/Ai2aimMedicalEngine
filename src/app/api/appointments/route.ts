/**
 * Appointments API - List and Create
 * GET  /api/appointments - List appointments with filtering
 * POST /api/appointments - Create new appointment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { BookingService } from '@/lib/scheduling/booking-service'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  staffId: z.string().uuid(),
  appointmentTypeId: z.string().uuid(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  durationMinutes: z.number().int().positive(),
  reasonForVisit: z.string().optional(),
  specialInstructions: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  relatedRecordId: z.string().uuid().optional(),
  relatedRecordType: z.enum(['prescription', 'sleep_study', 'dme_prescription', 'pft_test', 'referral']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients (id, first_name, last_name, date_of_birth),
        user_profiles!appointments_staff_id_fkey (id, full_name, role),
        appointment_types (type_code, name, color_code)
      `)

    // Apply filters
    const staffId = searchParams.get('staffId')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (staffId) query = query.eq('staff_id', staffId)
    if (patientId) query = query.eq('patient_id', patientId)
    if (status) query = query.eq('status', status)
    if (date) query = query.eq('appointment_date', date)
    if (startDate) query = query.gte('appointment_date', startDate)
    if (endDate) query = query.lte('appointment_date', endDate)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Execute query
    const { data, error, count } = await query
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createAppointmentSchema.parse(body)

    // Create appointment using booking service
    const appointment = await BookingService.createBooking(validated, user.id)

    return NextResponse.json({
      success: true,
      data: appointment
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
