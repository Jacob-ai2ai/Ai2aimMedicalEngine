/**
 * Appointments Availability API
 * GET /api/appointments/availability - Check staff availability
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/scheduling/booking-service'
import { z } from 'zod'

const availabilitySchema = z.object({
  staffId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.number().int().positive().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      staffId: searchParams.get('staffId'),
      date: searchParams.get('date'),
      durationMinutes: searchParams.get('durationMinutes') ? parseInt(searchParams.get('durationMinutes')!) : undefined
    }

    const validated = availabilitySchema.parse(params)
    
    const slots = await BookingService.checkAvailability(
      validated.staffId,
      new Date(validated.date),
      validated.durationMinutes
    )

    return NextResponse.json({
      success: true,
      data: slots
    })
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
