/**
 * Booking Service
 * Handles appointment scheduling, availability checking, and optimization
 */

import { createServerSupabase } from '@/lib/supabase/server'

// Type definitions for appointments (from migration 008)
interface Appointment {
  id: string
  appointment_number: string
  patient_id: string
  staff_id: string
  appointment_type_id: string
  location_id: string | null
  appointment_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: string
  priority: string
  related_prescription_id: string | null
  related_sleep_study_id: string | null
  related_dme_prescription_id: string | null
  related_pft_test_id: string | null
  related_referral_id: string | null
  booked_by: string | null
  booked_at: string
  confirmed_at: string | null
  confirmed_by: string | null
  checked_in_at: string | null
  started_at: string | null
  completed_at: string | null
  phone_reminder_sent: boolean
  email_reminder_sent: boolean
  sms_reminder_sent: boolean
  reason_for_visit: string | null
  special_instructions: string | null
  patient_notes: string | null
  staff_notes: string | null
  cancellation_reason: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  no_show_reason: string | null
  expected_revenue: number | null
  actual_revenue: number | null
  insurance_authorization_number: string | null
  created_at: string
  updated_at: string
}

interface AppointmentInsert {
  id?: string
  appointment_number: string
  patient_id: string
  staff_id: string
  appointment_type_id: string
  location_id?: string | null
  appointment_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  status?: string
  priority?: string
  related_prescription_id?: string | null
  related_sleep_study_id?: string | null
  related_dme_prescription_id?: string | null
  related_pft_test_id?: string | null
  related_referral_id?: string | null
  booked_by?: string | null
  reason_for_visit?: string | null
  special_instructions?: string | null
  expected_revenue?: number | null
}

export interface BookingCriteria {
  patientId: string
  appointmentTypeId: string
  preferredDate?: Date
  preferredTime?: string
  preferredStaffId?: string
  urgency: 'urgent' | 'high' | 'normal' | 'low'
  durationMinutes?: number
}

export interface TimeSlot {
  staffId: string
  staffName: string
  staffRole: string
  date: Date
  startTime: string
  endTime: string
  available: boolean
  score: number // 0-100 optimization score
  reasons: string[]
}

export interface BookingRequest {
  patientId: string
  staffId: string
  appointmentTypeId: string
  appointmentDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  reasonForVisit?: string
  specialInstructions?: string
  priority?: string
  relatedRecordId?: string
  relatedRecordType?: 'prescription' | 'sleep_study' | 'dme_prescription' | 'pft_test' | 'referral'
}

export class BookingService {
  /**
   * Find optimal time slots based on criteria
   */
  static async findOptimalSlot(criteria: BookingCriteria): Promise<TimeSlot[]> {
    const supabase = await createServerSupabase()
    
    const startDate = criteria.preferredDate || new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 14) // Look ahead 2 weeks

    // Get appointment type details
    const { data: appointmentType } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('id', criteria.appointmentTypeId)
      .single()

    if (!appointmentType) {
      throw new Error('Appointment type not found')
    }

    const duration = criteria.durationMinutes || appointmentType.default_duration

    // Get eligible staff based on role requirements
    const { data: eligibleStaff } = await supabase
      .from('user_profiles')
      .select('id, full_name, role')
      .in('role', appointmentType.requires_staff_role || [])
      .eq('is_active', true)

    if (!eligibleStaff || eligibleStaff.length === 0) {
      throw new Error('No eligible staff found for this appointment type')
    }

    const slots: TimeSlot[] = []

    // Check availability for each staff member
    for (const staff of eligibleStaff) {
      // If preferred staff specified, prioritize them
      if (criteria.preferredStaffId && staff.id !== criteria.preferredStaffId) {
        continue
      }

      // Get staff capacity for the date range
      const { data: capacityData } = await supabase
        .from('staff_capacity')
        .select('*')
        .eq('staff_id', staff.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      // Check available slots using the database function
      const { data: availableSlots, error } = await supabase.rpc(
        'get_staff_availability',
        {
          p_staff_id: staff.id,
          p_date: criteria.preferredDate?.toISOString().split('T')[0] || startDate.toISOString().split('T')[0],
          p_duration_minutes: duration
        }
      )

      if (availableSlots) {
        for (const slot of availableSlots) {
          if (slot.available) {
            // Calculate optimization score
            const capacity = capacityData?.find((c: any) => c.date === criteria.preferredDate?.toISOString().split('T')[0])
            const utilizationScore = capacity ? (100 - (capacity.utilization_percentage || 0)) : 50
            
            const matchScore = this.calculateMatchScore(
              staff,
              slot,
              criteria,
              capacity
            )

            slots.push({
              staffId: staff.id,
              staffName: staff.full_name || 'Unknown',
              staffRole: staff.role || 'unknown',
              date: new Date(criteria.preferredDate || startDate),
              startTime: slot.start_time,
              endTime: slot.end_time,
              available: true,
              score: matchScore,
              reasons: this.getMatchReasons(staff, capacity, criteria)
            })
          }
        }
      }
    }

    // Sort by score (highest first)
    return slots.sort((a, b) => b.score - a.score).slice(0, 10)
  }

  /**
   * Check staff availability for a specific date
   */
  static async checkAvailability(
    staffId: string,
    date: Date,
    durationMinutes: number = 30
  ): Promise<TimeSlot[]> {
    const supabase = await createServerSupabase()

    const { data: slots, error } = await supabase.rpc(
      'get_staff_availability',
      {
        p_staff_id: staffId,
        p_date: date.toISOString().split('T')[0],
        p_duration_minutes: durationMinutes
      }
    )

    if (error) throw error

    const { data: staff } = await supabase
      .from('user_profiles')
      .select('full_name, role')
      .eq('id', staffId)
      .single()

    return (slots || []).map((slot: any) => ({
      staffId,
      staffName: staff?.full_name || 'Unknown',
      staffRole: staff?.role || 'unknown',
      date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      available: slot.available,
      score: slot.available ? 100 : 0,
      reasons: [slot.reason]
    }))
  }

  /**
   * Create a new appointment booking
   */
  static async createBooking(
    booking: BookingRequest,
    bookedBy: string
  ): Promise<Appointment> {
    const supabase = await createServerSupabase()

    // Generate appointment number
    const appointmentNumber = await this.generateAppointmentNumber()

    // Get appointment type for revenue
    const { data: appointmentType } = await supabase
      .from('appointment_types')
      .select('revenue_value')
      .eq('id', booking.appointmentTypeId)
      .single()

    const appointmentData: AppointmentInsert = {
      appointment_number: appointmentNumber,
      patient_id: booking.patientId,
      staff_id: booking.staffId,
      appointment_type_id: booking.appointmentTypeId,
      appointment_date: booking.appointmentDate,
      start_time: booking.startTime,
      end_time: booking.endTime,
      duration_minutes: booking.durationMinutes,
      status: 'scheduled',
      priority: booking.priority || 'normal',
      reason_for_visit: booking.reasonForVisit,
      special_instructions: booking.specialInstructions,
      expected_revenue: appointmentType?.revenue_value,
      booked_by: bookedBy
    }

    // Add related record references
    if (booking.relatedRecordId && booking.relatedRecordType) {
      switch (booking.relatedRecordType) {
        case 'prescription':
          appointmentData.related_prescription_id = booking.relatedRecordId
          break
        case 'sleep_study':
          appointmentData.related_sleep_study_id = booking.relatedRecordId
          break
        case 'dme_prescription':
          appointmentData.related_dme_prescription_id = booking.relatedRecordId
          break
        case 'pft_test':
          appointmentData.related_pft_test_id = booking.relatedRecordId
          break
        case 'referral':
          appointmentData.related_referral_id = booking.relatedRecordId
          break
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single()

    if (error) throw error

    // Schedule reminders (async - don't wait)
    this.scheduleReminders(data.id).catch(console.error)

    return data
  }

  /**
   * Handle no-show
   */
  static async handleNoShow(
    appointmentId: string,
    reason?: string
  ): Promise<void> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'no_show',
        no_show_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (error) throw error

    // Try to fill the slot from waitlist
    await this.fillFromWaitlist(appointmentId).catch(console.error)
  }

  /**
   * Handle cancellation
   */
  static async handleCancellation(
    appointmentId: string,
    reason: string,
    cancelledBy: string
  ): Promise<void> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: cancelledBy,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (error) throw error

    // Try to fill the slot from waitlist
    await this.fillFromWaitlist(appointmentId).catch(console.error)
  }

  /**
   * Confirm appointment
   */
  static async confirmAppointment(
    appointmentId: string,
    confirmedBy: 'patient' | 'staff' | 'automated'
  ): Promise<void> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: confirmedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (error) throw error
  }

  /**
   * Check in patient
   */
  static async checkInPatient(appointmentId: string): Promise<void> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (error) throw error
  }

  /**
   * Mark appointment as complete
   */
  static async completeAppointment(
    appointmentId: string,
    actualRevenue?: number,
    notes?: string
  ): Promise<void> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        actual_revenue: actualRevenue,
        staff_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (error) throw error
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ): Promise<Appointment> {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        status: 'rescheduled',
        staff_notes: reason ? `Rescheduled: ${reason}` : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) throw error

    return data
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private static calculateMatchScore(
    staff: any,
    slot: any,
    criteria: BookingCriteria,
    capacity: any
  ): number {
    let score = 50 // Base score

    // Prefer staff with lower utilization (helps balance workload)
    if (capacity) {
      const utilizationBonus = Math.max(0, 100 - (capacity.utilization_percentage || 0))
      score += utilizationBonus * 0.3
    }

    // Preferred staff gets bonus
    if (criteria.preferredStaffId && staff.id === criteria.preferredStaffId) {
      score += 20
    }

    // Preferred time match
    if (criteria.preferredTime && slot.start_time === criteria.preferredTime) {
      score += 15
    }

    // Urgency adjustments
    if (criteria.urgency === 'urgent') {
      score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  private static getMatchReasons(
    staff: any,
    capacity: any,
    criteria: BookingCriteria
  ): string[] {
    const reasons: string[] = []

    if (capacity && capacity.utilization_percentage < 75) {
      reasons.push(`Helps improve ${staff.full_name}'s utilization (currently ${capacity.utilization_percentage.toFixed(0)}%)`)
    }

    if (criteria.preferredStaffId && staff.id === criteria.preferredStaffId) {
      reasons.push('Your preferred provider')
    }

    reasons.push('Available slot')

    return reasons
  }

  private static async generateAppointmentNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `APT${year}${month}${random}`
  }

  private static async scheduleReminders(appointmentId: string): Promise<void> {
    // TODO: Implement reminder scheduling via edge function or cron job
    console.log(`Scheduling reminders for appointment ${appointmentId}`)
  }

  private static async fillFromWaitlist(appointmentId: string): Promise<void> {
    // TODO: Implement waitlist filling logic
    console.log(`Attempting to fill slot from waitlist for appointment ${appointmentId}`)
  }
}
