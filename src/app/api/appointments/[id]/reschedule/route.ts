/**
 * Reschedule Appointment API
 * POST /api/appointments/[id]/reschedule
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/scheduling/booking-service'
import { z } from 'zod'

const rescheduleSchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newStartTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  newEndTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  reason: z.string().optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { newDate, newStartTime, newEndTime, reason } = rescheduleSchema.parse(body)
    
    const appointment = await BookingService.rescheduleAppointment(
      params.id,
      newDate,
      newStartTime,
      newEndTime,
      reason
    )

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment rescheduled'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
