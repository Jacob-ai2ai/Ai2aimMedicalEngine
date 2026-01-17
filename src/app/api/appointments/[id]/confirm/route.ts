/**
 * Confirm Appointment API
 * POST /api/appointments/[id]/confirm
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/scheduling/booking-service'
import { z } from 'zod'

const confirmSchema = z.object({
  confirmedBy: z.enum(['patient', 'staff', 'automated'])
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { confirmedBy } = confirmSchema.parse(body)
    
    await BookingService.confirmAppointment(params.id, confirmedBy)

    return NextResponse.json({
      success: true,
      message: 'Appointment confirmed'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
