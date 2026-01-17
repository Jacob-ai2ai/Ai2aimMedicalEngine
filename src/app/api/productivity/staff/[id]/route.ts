/**
 * Staff Productivity Metrics API
 * GET /api/productivity/staff/[id] - Get individual staff productivity metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { ProductivityTracker } from '@/lib/scheduling/productivity-tracker'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get date range from query params
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    
    const period = {
      start: new Date(startDate),
      end: new Date(endDate)
    }
    
    const metrics = await ProductivityTracker.getStaffMetrics(params.id, period)

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
