/**
 * Find Optimal Appointment Slots API
 * POST /api/appointments/find-optimal - Find best available slots
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/scheduling/booking-service'
import { z } from 'zod'

const findOptimalSchema = z.object({
  patientId: z.string().uuid(),
  appointmentTypeId: z.string().uuid(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  preferredStaffId: z.string().uuid().optional(),
  urgency: z.enum(['urgent', 'high', 'normal', 'low']),
  durationMinutes: z.number().int().positive().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = findOptimalSchema.parse(body)
    
    const criteria = {
      ...validated,
      preferredDate: validated.preferredDate ? new Date(validated.preferredDate) : undefined
    }
    
    const slots = await BookingService.findOptimalSlot(criteria)

    return NextResponse.json({
      success: true,
      data: slots,
      message: `Found ${slots.length} optimal time slots`
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
