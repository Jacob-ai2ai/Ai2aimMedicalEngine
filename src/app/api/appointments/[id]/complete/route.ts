/**
 * Complete Appointment API
 * POST /api/appointments/[id]/complete
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/scheduling/booking-service'
import { z } from 'zod'

const completeSchema = z.object({
  actualRevenue: z.number().optional(),
  notes: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { actualRevenue, notes } = completeSchema.parse(body)
    
    await BookingService.completeAppointment(params.id, actualRevenue, notes)

    return NextResponse.json({
      success: true,
      message: 'Appointment completed'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
