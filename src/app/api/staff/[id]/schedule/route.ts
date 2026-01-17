/**
 * Staff Schedule Management API
 * GET /api/staff/[id]/schedule - Get staff schedule
 * PUT /api/staff/[id]/schedule - Update staff schedule
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const scheduleUpdateSchema = z.object({
  day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  break_start: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  break_end: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  max_appointments_per_day: z.number().int().positive().optional(),
  default_appointment_duration: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  effective_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get staff schedule for all days
    const { data, error } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', params.id)
      .eq('is_active', true)
      .order('day_of_week')

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = scheduleUpdateSchema.parse(body)

    // Update or insert schedule
    const { data, error } = await supabase
      .from('staff_schedules')
      .upsert({
        staff_id: params.id,
        ...validated,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Recalculate capacity for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      await supabase.rpc('calculate_staff_capacity', {
        p_staff_id: params.id,
        p_date: date.toISOString().split('T')[0]
      })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Schedule updated and capacity recalculated'
    })
  } catch (error: any) {
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
