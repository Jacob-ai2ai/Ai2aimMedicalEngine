/**
 * Staff Capacity API
 * GET /api/staff/[id]/capacity - Get staff capacity statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { CapacityManager } from '@/lib/scheduling/capacity-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get date range (default to next 7 days)
    const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0]
    const endDate = searchParams.get('endDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Get capacity data for the range
    const capacityData = await CapacityManager.getCapacityRange(
      [params.id],
      new Date(startDate),
      new Date(endDate)
    )

    // Get forecast
    const forecast = await CapacityManager.forecastCapacity(params.id, 30)

    // Calculate summary statistics
    const summary = {
      averageUtilization: capacityData.length > 0 
        ? capacityData.reduce((sum, c) => sum + Number(c.utilization_percentage), 0) / capacityData.length
        : 0,
      totalAppointments: capacityData.reduce((sum, c) => sum + c.appointments_scheduled, 0),
      totalRevenue: capacityData.reduce((sum, c) => sum + Number(c.revenue_expected), 0),
      daysWithLowUtilization: capacityData.filter(c => Number(c.utilization_percentage) < 75).length,
      forecast
    }

    return NextResponse.json({
      success: true,
      data: {
        capacity: capacityData,
        summary,
        forecast
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
