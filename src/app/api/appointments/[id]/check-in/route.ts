/**
 * Check-in Appointment API
 * POST /api/appointments/[id]/check-in
 */

import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/scheduling/booking-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await BookingService.checkInPatient(params.id)

    return NextResponse.json({
      success: true,
      message: 'Patient checked in'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
