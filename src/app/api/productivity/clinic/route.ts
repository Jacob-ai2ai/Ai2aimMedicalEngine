/**
 * Clinic-Wide Productivity Metrics API
 * GET /api/productivity/clinic - Get clinic-wide productivity metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { ProductivityTracker } from '@/lib/scheduling/productivity-tracker'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get date range from query params (default to last 7 days)
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]
    
    const period = {
      start: new Date(startDate),
      end: new Date(endDate)
    }
    
    const metrics = await ProductivityTracker.getClinicMetrics(period)

    return NextResponse.json({
      success: true,
      data: metrics,
      meta: {
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
