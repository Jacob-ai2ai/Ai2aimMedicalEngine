/**
 * Underutilized Staff API
 * GET /api/productivity/underutilized - Get list of underutilized staff
 */

import { NextRequest, NextResponse } from 'next/server'
import { CapacityManager } from '@/lib/scheduling/capacity-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get date and threshold from query params
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const threshold = parseFloat(searchParams.get('threshold') || '75')
    
    const underutilized = await CapacityManager.getUnderutilizedStaff(
      new Date(date),
      threshold
    )

    // Calculate totals
    const totals = {
      count: underutilized.length,
      totalAvailableMinutes: underutilized.reduce((sum, s) => sum + s.available_minutes, 0),
      totalRevenuePotential: underutilized.reduce((sum, s) => sum + s.revenue_potential, 0),
      averageUtilization: underutilized.length > 0 
        ? underutilized.reduce((sum, s) => sum + Number(s.utilization_percentage), 0) / underutilized.length 
        : 0
    }

    return NextResponse.json({
      success: true,
      data: underutilized,
      summary: {
        ...totals,
        potentialAppointments: Math.floor(totals.totalAvailableMinutes / 30),
        date,
        threshold
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
