/**
 * Staff Time Off API
 * GET  /api/staff/[id]/time-off - Get time off requests
 * POST /api/staff/[id]/time-off - Create time off request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const timeOffSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  all_day: z.boolean().default(true),
  reason: z.enum(['vacation', 'sick', 'meeting', 'training', 'personal', 'blocked']),
  description: z.string().optional(),
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected'

    let query = supabase
      .from('staff_time_off')
      .select('*, approved_by_profile:user_profiles!staff_time_off_approved_by_fkey(full_name)')
      .eq('staff_id', params.id)
      .order('start_date', { ascending: false })

    if (status === 'pending') {
      query = query.is('is_approved', null)
    } else if (status === 'approved') {
      query = query.eq('is_approved', true)
    } else if (status === 'rejected') {
      query = query.eq('is_approved', false)
    }

    const { data, error } = await query

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

export async function POST(
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
    const validated = timeOffSchema.parse(body)

    const { data, error } = await supabase
      .from('staff_time_off')
      .insert({
        staff_id: params.id,
        ...validated
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Time off request submitted'
    }, { status: 201 })
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
