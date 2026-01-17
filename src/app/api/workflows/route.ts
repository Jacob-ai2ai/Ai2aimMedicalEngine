/**
 * Workflows API Route
 * Handle CRUD operations for visual workflows
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { VisualWorkflow } from '@/types/workflow-visual'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    
    let query = supabase
      .from('workflow_definitions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (isActive === 'true') {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    // Convert database format to VisualWorkflow format
    const workflows: VisualWorkflow[] = (data || []).map((wf: any) => ({
      id: wf.id,
      name: wf.name,
      description: wf.description || '',
      nodes: wf.nodes || [],
      edges: wf.edges || [],
      version: wf.version || 1,
      isActive: wf.is_active || false,
      createdAt: wf.created_at,
      updatedAt: wf.updated_at,
      createdBy: wf.created_by
    }))
    
    return NextResponse.json({ success: true, data: workflows })
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
    const workflow: VisualWorkflow = await request.json()
    
    // Convert VisualWorkflow to database format
    const { data, error } = await supabase
      .from('workflow_definitions')
      .insert({
        slug: workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: workflow.name,
        description: workflow.description,
        trigger_type: 'manual', // Default, can be updated
        trigger_config: {},
        steps: [], // Store nodes/edges in steps for now
        nodes: workflow.nodes, // Store as JSONB
        edges: workflow.edges, // Store as JSONB
        is_active: workflow.isActive,
        version: workflow.version || 1
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
