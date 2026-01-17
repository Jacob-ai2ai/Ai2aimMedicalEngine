/**
 * Medications API
 * GET  /api/medications - List medications with search
 * POST /api/medications - Create medication
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const createMedicationSchema = z.object({
  name: z.string().min(1),
  generic_name: z.string().optional(),
  brand_names: z.array(z.string()).optional(),
  drug_class: z.string().optional(),
  controlled_substance_schedule: z.string().optional(),
  dosage_forms: z.array(z.string()).optional(),
  common_dosages: z.array(z.string()).optional(),
  administration_routes: z.array(z.string()).optional(),
  indications: z.string().optional(),
  contraindications: z.string().optional(),
  side_effects: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
  pregnancy_category: z.string().optional(),
  ndc_code: z.string().optional(),
  rxnorm_code: z.string().optional(),
  is_active: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Search parameters
    const search = searchParams.get('search')
    const drugClass = searchParams.get('drugClass')
    const isControlled = searchParams.get('controlled') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('medications')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`)
    }
    
    if (drugClass) {
      query = query.eq('drug_class', drugClass)
    }
    
    if (isControlled) {
      query = query.not('controlled_substance_schedule', 'is', null)
    }

    // Execute with pagination
    const { data, error, count } = await query
      .order('name')
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or physician role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || !['admin', 'physician'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createMedicationSchema.parse(body)

    const { data, error } = await supabase
      .from('medications')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
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
