-- Migration 008: Staff Scheduling & Productivity Management
-- Purpose: Track staff schedules, appointments, capacity, and productivity
-- Business Goal: Maximize staff utilization and revenue

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE day_of_week AS ENUM (
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled', 'confirmed', 'checked_in', 'in_progress', 
  'completed', 'no_show', 'cancelled', 'rescheduled'
);

CREATE TYPE time_off_reason AS ENUM (
  'vacation', 'sick', 'meeting', 'training', 'personal', 'blocked'
);

-- ============================================================================
-- STAFF SCHEDULES TABLE
-- ============================================================================

CREATE TABLE public.staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  effective_from DATE,
  effective_until DATE,
  
  -- Break times
  break_start TIME,
  break_end TIME,
  
  -- Capacity settings
  max_appointments_per_day INTEGER DEFAULT 16,
  default_appointment_duration INTEGER DEFAULT 30, -- minutes
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no overlapping schedules for same staff/day
  CONSTRAINT unique_staff_day UNIQUE(staff_id, day_of_week, effective_from)
);

-- ============================================================================
-- APPOINTMENT TYPES TABLE
-- ============================================================================

CREATE TABLE public.appointment_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Timing
  default_duration INTEGER NOT NULL, -- minutes
  preparation_time INTEGER DEFAULT 5, -- minutes before
  cleanup_time INTEGER DEFAULT 5, -- minutes after
  buffer_time INTEGER DEFAULT 10, -- gap to next appointment
  
  -- Display
  color_code TEXT DEFAULT '#3B82F6', -- for calendar
  icon TEXT,
  
  -- Requirements
  requires_equipment BOOLEAN DEFAULT FALSE,
  equipment_type TEXT, -- 'sleep_monitor', 'cpap_machine', 'spirometer'
  requires_staff_role user_role[], -- which roles can perform
  
  -- Business
  revenue_value DECIMAL(10, 2), -- expected revenue
  insurance_billable BOOLEAN DEFAULT TRUE,
  requires_authorization BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_number TEXT UNIQUE NOT NULL,
  
  -- Core fields
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  appointment_type_id UUID NOT NULL REFERENCES public.appointment_types(id),
  location_id UUID REFERENCES public.locations(id), -- if multi-location
  
  -- Timing
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Status
  status appointment_status DEFAULT 'scheduled',
  priority TEXT DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'low'
  
  -- Related records
  related_prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  related_sleep_study_id UUID REFERENCES public.sleep_studies(id) ON DELETE SET NULL,
  related_dme_prescription_id UUID REFERENCES public.dme_prescriptions(id) ON DELETE SET NULL,
  related_pft_test_id UUID REFERENCES public.pft_tests(id) ON DELETE SET NULL,
  related_referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  
  -- Booking tracking
  booked_by UUID REFERENCES public.user_profiles(id),
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by TEXT, -- 'patient', 'staff', 'automated'
  checked_in_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Patient communication
  phone_reminder_sent BOOLEAN DEFAULT FALSE,
  phone_reminder_sent_at TIMESTAMPTZ,
  email_reminder_sent BOOLEAN DEFAULT FALSE,
  email_reminder_sent_at TIMESTAMPTZ,
  sms_reminder_sent BOOLEAN DEFAULT FALSE,
  sms_reminder_sent_at TIMESTAMPTZ,
  
  -- Visit details
  reason_for_visit TEXT,
  special_instructions TEXT,
  patient_notes TEXT,
  staff_notes TEXT,
  
  -- Cancellation/No-show
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.user_profiles(id),
  cancelled_at TIMESTAMPTZ,
  no_show_reason TEXT,
  
  -- Billing
  expected_revenue DECIMAL(10, 2),
  actual_revenue DECIMAL(10, 2),
  insurance_authorization_number TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent double-booking
  CONSTRAINT no_staff_overlap EXCLUDE USING gist (
    staff_id WITH =,
    daterange(appointment_date, appointment_date, '[]') WITH &&,
    timerange(start_time, end_time, '[)') WITH &&
  ) WHERE (status NOT IN ('cancelled', 'no_show'))
);

-- ============================================================================
-- STAFF CAPACITY TABLE (Real-time tracking)
-- ============================================================================

CREATE TABLE public.staff_capacity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Time tracking (minutes)
  total_available_minutes INTEGER NOT NULL,
  booked_minutes INTEGER DEFAULT 0,
  completed_minutes INTEGER DEFAULT 0,
  blocked_minutes INTEGER DEFAULT 0, -- PTO, meetings
  
  -- Utilization
  utilization_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Appointment counts
  appointments_scheduled INTEGER DEFAULT 0,
  appointments_completed INTEGER DEFAULT 0,
  appointments_cancelled INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  
  -- Revenue
  revenue_expected DECIMAL(10, 2) DEFAULT 0,
  revenue_actual DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_id, date)
);

-- ============================================================================
-- STAFF TIME OFF TABLE
-- ============================================================================

CREATE TABLE public.staff_time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Time period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME, -- null = all day
  end_time TIME,
  all_day BOOLEAN DEFAULT TRUE,
  
  -- Reason
  reason time_off_reason NOT NULL,
  description TEXT,
  
  -- Approval
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES public.user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BOOKING RULES TABLE
-- ============================================================================

CREATE TABLE public.booking_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT UNIQUE NOT NULL,
  rule_type TEXT NOT NULL, -- 'availability', 'capacity', 'buffer', 'priority', 'overbooking'
  description TEXT,
  
  -- Scope
  staff_role user_role, -- applies to specific role (null = all)
  appointment_type_code TEXT, -- applies to specific type (null = all)
  location_id UUID REFERENCES public.locations(id), -- applies to location (null = all)
  
  -- Rule configuration (JSON)
  rule_config JSONB NOT NULL,
  
  -- Priority
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0, -- higher number = higher priority
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPOINTMENT WAITLIST TABLE
-- ============================================================================

CREATE TABLE public.appointment_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_type_id UUID NOT NULL REFERENCES public.appointment_types(id),
  
  -- Preferences
  preferred_staff_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  preferred_location_id UUID REFERENCES public.locations(id),
  
  -- Priority
  urgency TEXT DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'low'
  priority_score INTEGER DEFAULT 50, -- 0-100, calculated
  
  -- Status
  status TEXT DEFAULT 'waiting', -- 'waiting', 'offered', 'accepted', 'declined', 'expired'
  offered_slot_time TIMESTAMPTZ,
  offer_expires_at TIMESTAMPTZ,
  
  -- Notes
  reason TEXT,
  notes TEXT,
  
  added_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Staff schedules
CREATE INDEX idx_staff_schedules_staff ON public.staff_schedules(staff_id, is_active);
CREATE INDEX idx_staff_schedules_day ON public.staff_schedules(day_of_week) WHERE is_active = TRUE;

-- Appointments
CREATE INDEX idx_appointments_staff_date ON public.appointments(staff_id, appointment_date);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id, appointment_date DESC);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX idx_appointments_status ON public.appointments(status, appointment_date);
CREATE INDEX idx_appointments_number ON public.appointments(appointment_number);
CREATE INDEX idx_appointments_upcoming ON public.appointments(appointment_date, start_time) 
  WHERE status IN ('scheduled', 'confirmed') AND appointment_date >= CURRENT_DATE;

-- Appointment types
CREATE INDEX idx_appointment_types_code ON public.appointment_types(type_code) WHERE is_active = TRUE;
CREATE INDEX idx_appointment_types_active ON public.appointment_types(is_active);

-- Staff capacity
CREATE INDEX idx_staff_capacity_staff_date ON public.staff_capacity(staff_id, date DESC);
CREATE INDEX idx_staff_capacity_date ON public.staff_capacity(date) WHERE utilization_percentage < 75;
CREATE INDEX idx_staff_capacity_underutilized ON public.staff_capacity(utilization_percentage) 
  WHERE date >= CURRENT_DATE AND utilization_percentage < 75;

-- Time off
CREATE INDEX idx_staff_time_off_staff ON public.staff_time_off(staff_id, start_date DESC);
CREATE INDEX idx_staff_time_off_dates ON public.staff_time_off(start_date, end_date) WHERE is_approved = TRUE;

-- Waitlist
CREATE INDEX idx_waitlist_patient ON public.appointment_waitlist(patient_id) WHERE status = 'waiting';
CREATE INDEX idx_waitlist_priority ON public.appointment_waitlist(priority_score DESC, created_at) 
  WHERE status = 'waiting';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_waitlist ENABLE ROW LEVEL SECURITY;

-- Staff schedules policies
CREATE POLICY "Staff can view own schedule"
  ON public.staff_schedules FOR SELECT
  USING (staff_id = auth.uid() OR has_any_role(ARRAY['admin', 'administrative']::user_role[]));

CREATE POLICY "Admins can manage all schedules"
  ON public.staff_schedules FOR ALL
  USING (has_any_role(ARRAY['admin', 'administrative']::user_role[]));

-- Appointment types policies
CREATE POLICY "All staff can view appointment types"
  ON public.appointment_types FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

CREATE POLICY "Admins can manage appointment types"
  ON public.appointment_types FOR ALL
  USING (has_role('admin'::user_role));

-- Appointments policies
CREATE POLICY "Staff can view appointments they're involved in"
  ON public.appointments FOR SELECT
  USING (
    staff_id = auth.uid() OR
    booked_by = auth.uid() OR
    has_any_role(ARRAY['admin', 'administrative']::user_role[])
  );

CREATE POLICY "Authorized staff can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    has_any_role(ARRAY['admin', 'physician', 'nurse', 'administrative']::user_role[])
  );

CREATE POLICY "Staff can update own appointments"
  ON public.appointments FOR UPDATE
  USING (
    staff_id = auth.uid() OR
    booked_by = auth.uid() OR
    has_any_role(ARRAY['admin', 'administrative']::user_role[])
  );

CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE
  USING (has_role('admin'::user_role));

-- Staff capacity policies
CREATE POLICY "Staff can view own capacity"
  ON public.staff_capacity FOR SELECT
  USING (staff_id = auth.uid() OR has_any_role(ARRAY['admin', 'administrative']::user_role[]));

CREATE POLICY "System can manage capacity"
  ON public.staff_capacity FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Time off policies
CREATE POLICY "Staff can view own time off"
  ON public.staff_time_off FOR SELECT
  USING (staff_id = auth.uid() OR has_any_role(ARRAY['admin', 'administrative']::user_role[]));

CREATE POLICY "Staff can request time off"
  ON public.staff_time_off FOR INSERT
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Admins can manage time off"
  ON public.staff_time_off FOR ALL
  USING (has_role('admin'::user_role));

-- Booking rules policies
CREATE POLICY "All staff can view booking rules"
  ON public.booking_rules FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

CREATE POLICY "Admins can manage booking rules"
  ON public.booking_rules FOR ALL
  USING (has_role('admin'::user_role));

-- Waitlist policies
CREATE POLICY "Staff can view waitlist"
  ON public.appointment_waitlist FOR SELECT
  USING (has_any_role(ARRAY['admin', 'physician', 'nurse', 'administrative']::user_role[]));

CREATE POLICY "Authorized staff can manage waitlist"
  ON public.appointment_waitlist FOR ALL
  USING (has_any_role(ARRAY['admin', 'physician', 'nurse', 'administrative']::user_role[]));

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON public.staff_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_types_updated_at BEFORE UPDATE ON public.appointment_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_capacity_updated_at BEFORE UPDATE ON public.staff_capacity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_time_off_updated_at BEFORE UPDATE ON public.staff_time_off
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_rules_updated_at BEFORE UPDATE ON public.booking_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_waitlist_updated_at BEFORE UPDATE ON public.appointment_waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CAPACITY CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_staff_capacity(p_staff_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_schedule RECORD;
  v_total_minutes INTEGER;
  v_booked_minutes INTEGER;
  v_completed_minutes INTEGER;
  v_blocked_minutes INTEGER;
  v_break_minutes INTEGER;
  v_appointments_scheduled INTEGER;
  v_appointments_completed INTEGER;
  v_appointments_cancelled INTEGER;
  v_no_shows INTEGER;
  v_revenue_expected DECIMAL(10, 2);
  v_revenue_actual DECIMAL(10, 2);
BEGIN
  -- Get staff schedule for the day
  SELECT * INTO v_schedule
  FROM public.staff_schedules
  WHERE staff_id = p_staff_id
    AND day_of_week = LOWER(TO_CHAR(p_date, 'Day'))::day_of_week
    AND is_active = TRUE
    AND (effective_from IS NULL OR effective_from <= p_date)
    AND (effective_until IS NULL OR effective_until >= p_date)
  LIMIT 1;

  IF NOT FOUND THEN
    -- No schedule for this day
    RETURN;
  END IF;

  -- Calculate total available minutes
  v_total_minutes := EXTRACT(EPOCH FROM (v_schedule.end_time - v_schedule.start_time)) / 60;
  
  -- Subtract break time
  IF v_schedule.break_start IS NOT NULL AND v_schedule.break_end IS NOT NULL THEN
    v_break_minutes := EXTRACT(EPOCH FROM (v_schedule.break_end - v_schedule.break_start)) / 60;
    v_total_minutes := v_total_minutes - v_break_minutes;
  END IF;

  -- Calculate booked time
  SELECT 
    COALESCE(SUM(duration_minutes), 0),
    COALESCE(SUM(CASE WHEN status = 'completed' THEN duration_minutes ELSE 0 END), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    COUNT(*) FILTER (WHERE status = 'no_show'),
    COALESCE(SUM(expected_revenue), 0),
    COALESCE(SUM(actual_revenue), 0)
  INTO 
    v_booked_minutes,
    v_completed_minutes,
    v_appointments_scheduled,
    v_appointments_completed,
    v_appointments_cancelled,
    v_no_shows,
    v_revenue_expected,
    v_revenue_actual
  FROM public.appointments
  WHERE staff_id = p_staff_id
    AND appointment_date = p_date
    AND status NOT IN ('cancelled');

  -- Calculate blocked time (time off)
  SELECT COALESCE(SUM(
    CASE 
      WHEN all_day THEN v_total_minutes
      ELSE EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    END
  ), 0)
  INTO v_blocked_minutes
  FROM public.staff_time_off
  WHERE staff_id = p_staff_id
    AND p_date BETWEEN start_date AND end_date
    AND is_approved = TRUE;

  -- Upsert capacity record
  INSERT INTO public.staff_capacity (
    staff_id,
    date,
    total_available_minutes,
    booked_minutes,
    completed_minutes,
    blocked_minutes,
    utilization_percentage,
    appointments_scheduled,
    appointments_completed,
    appointments_cancelled,
    no_shows,
    revenue_expected,
    revenue_actual,
    last_calculated_at
  ) VALUES (
    p_staff_id,
    p_date,
    v_total_minutes - v_blocked_minutes,
    v_booked_minutes,
    v_completed_minutes,
    v_blocked_minutes,
    CASE 
      WHEN (v_total_minutes - v_blocked_minutes) > 0 
      THEN (v_booked_minutes::DECIMAL / (v_total_minutes - v_blocked_minutes)) * 100
      ELSE 0
    END,
    v_appointments_scheduled,
    v_appointments_completed,
    v_appointments_cancelled,
    v_no_shows,
    v_revenue_expected,
    v_revenue_actual,
    NOW()
  )
  ON CONFLICT (staff_id, date)
  DO UPDATE SET
    total_available_minutes = EXCLUDED.total_available_minutes,
    booked_minutes = EXCLUDED.booked_minutes,
    completed_minutes = EXCLUDED.completed_minutes,
    blocked_minutes = EXCLUDED.blocked_minutes,
    utilization_percentage = EXCLUDED.utilization_percentage,
    appointments_scheduled = EXCLUDED.appointments_scheduled,
    appointments_completed = EXCLUDED.appointments_completed,
    appointments_cancelled = EXCLUDED.appointments_cancelled,
    no_shows = EXCLUDED.no_shows,
    revenue_expected = EXCLUDED.revenue_expected,
    revenue_actual = EXCLUDED.revenue_actual,
    last_calculated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO AUTO-UPDATE CAPACITY
-- ============================================================================

CREATE OR REPLACE FUNCTION update_staff_capacity_on_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update capacity for the affected date and staff
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_staff_capacity(NEW.staff_id, NEW.appointment_date);
  END IF;
  
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.staff_id != NEW.staff_id) THEN
    PERFORM calculate_staff_capacity(OLD.staff_id, OLD.appointment_date);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_capacity_update
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_capacity_on_appointment_change();

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_staff_schedules
  AFTER INSERT OR UPDATE OR DELETE ON public.staff_schedules
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================================================
-- SEED DATA - DEFAULT APPOINTMENT TYPES
-- ============================================================================

INSERT INTO public.appointment_types (type_code, name, description, default_duration, revenue_value, requires_staff_role, color_code) VALUES
('consultation', 'Initial Consultation', 'First visit consultation', 45, 200.00, ARRAY['physician']::user_role[], '#3B82F6'),
('follow_up', 'Follow-up Visit', 'Routine follow-up appointment', 30, 150.00, ARRAY['physician', 'nurse']::user_role[], '#10B981'),
('sleep_study_setup', 'Sleep Study Setup', 'Setup and training for home sleep study', 30, 100.00, ARRAY['nurse', 'administrative']::user_role[], '#8B5CF6'),
('cpap_training', 'CPAP Training', 'Initial CPAP setup and training', 60, 250.00, ARRAY['nurse']::user_role[], '#F59E0B'),
('cpap_follow_up', 'CPAP Follow-up', 'CPAP compliance check and adjustment', 30, 100.00, ARRAY['nurse']::user_role[], '#EF4444'),
('equipment_pickup', 'Equipment Pickup', 'DME equipment pickup or return', 15, 0.00, ARRAY['administrative']::user_role[], '#6B7280'),
('pft_test', 'PFT Testing', 'Pulmonary function testing', 45, 300.00, ARRAY['nurse']::user_role[], '#EC4899'),
('compliance_check', 'Compliance Check', 'Equipment compliance review', 20, 75.00, ARRAY['nurse', 'administrative']::user_role[], '#14B8A6');

-- ============================================================================
-- SEED DATA - DEFAULT BOOKING RULES
-- ============================================================================

INSERT INTO public.booking_rules (rule_name, rule_type, description, rule_config, priority) VALUES
('minimum-gap-between-appointments', 'buffer', 'Minimum 10-minute gap between appointments', 
  '{"minimumGap": 10, "maximumGap": 30, "preferredGap": 15}'::jsonb, 10),
('lunch-break-protection', 'availability', 'Protect lunch break 12-1 PM', 
  '{"startTime": "12:00", "endTime": "13:00", "blockBookings": true}'::jsonb, 100),
('urgent-priority-override', 'priority', 'Allow overbooking for urgent appointments', 
  '{"allowOverbooking": true, "maxOverbook": 2, "appointmentTypes": ["consultation"]}'::jsonb, 50),
('utilization-target', 'capacity', 'Alert when utilization below 75%', 
  '{"threshold": 75, "action": "alert_admin"}'::jsonb, 20),
('same-day-booking-limit', 'capacity', 'Limit same-day bookings to prevent overbooking', 
  '{"sameDayLimit": 2, "exception": ["urgent"]}'::jsonb, 30);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get staff availability for a specific date
CREATE OR REPLACE FUNCTION get_staff_availability(
  p_staff_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  start_time TIME,
  end_time TIME,
  available BOOLEAN,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH 
    schedule AS (
      SELECT s.start_time, s.end_time, s.break_start, s.break_end
      FROM public.staff_schedules s
      WHERE s.staff_id = p_staff_id
        AND s.day_of_week = LOWER(TO_CHAR(p_date, 'Day'))::day_of_week
        AND s.is_active = TRUE
        AND (s.effective_from IS NULL OR s.effective_from <= p_date)
        AND (s.effective_until IS NULL OR s.effective_until >= p_date)
      LIMIT 1
    ),
    appointments AS (
      SELECT a.start_time, a.end_time
      FROM public.appointments a
      WHERE a.staff_id = p_staff_id
        AND a.appointment_date = p_date
        AND a.status NOT IN ('cancelled', 'no_show')
    ),
    time_off AS (
      SELECT t.start_time, t.end_time, t.all_day
      FROM public.staff_time_off t
      WHERE t.staff_id = p_staff_id
        AND p_date BETWEEN t.start_date AND t.end_date
        AND t.is_approved = TRUE
    )
  SELECT 
    gs.start_time,
    gs.start_time + (p_duration_minutes || ' minutes')::INTERVAL AS end_time,
    NOT EXISTS (
      SELECT 1 FROM appointments a 
      WHERE gs.start_time < a.end_time 
        AND (gs.start_time + (p_duration_minutes || ' minutes')::INTERVAL) > a.start_time
    ) AND NOT EXISTS (
      SELECT 1 FROM time_off t
      WHERE t.all_day = TRUE
         OR (gs.start_time < t.end_time 
             AND (gs.start_time + (p_duration_minutes || ' minutes')::INTERVAL) > t.start_time)
    ) AS available,
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM schedule) THEN 'Not scheduled to work'
      WHEN EXISTS (SELECT 1 FROM time_off WHERE all_day = TRUE) THEN 'Time off (all day)'
      WHEN EXISTS (SELECT 1 FROM appointments a WHERE gs.start_time < a.end_time) THEN 'Already booked'
      ELSE 'Available'
    END AS reason
  FROM generate_series(
    (SELECT COALESCE(s.start_time, '09:00'::TIME) FROM schedule s),
    (SELECT COALESCE(s.end_time, '17:00'::TIME) FROM schedule s) - (p_duration_minutes || ' minutes')::INTERVAL,
    (p_duration_minutes || ' minutes')::INTERVAL
  ) AS gs(start_time);
END;
$$ LANGUAGE plpgsql;

-- Get underutilized staff for a date
CREATE OR REPLACE FUNCTION get_underutilized_staff(
  p_date DATE,
  p_threshold DECIMAL DEFAULT 75.0
)
RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  role user_role,
  utilization_percentage DECIMAL,
  available_minutes INTEGER,
  revenue_potential DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.staff_id,
    up.full_name,
    up.role,
    sc.utilization_percentage,
    sc.total_available_minutes - sc.booked_minutes AS available_minutes,
    (sc.total_available_minutes - sc.booked_minutes) / 30.0 * 150.00 AS revenue_potential
  FROM public.staff_capacity sc
  JOIN public.user_profiles up ON sc.staff_id = up.id
  WHERE sc.date = p_date
    AND sc.utilization_percentage < p_threshold
    AND up.role IN ('physician', 'nurse', 'administrative')
  ORDER BY sc.utilization_percentage ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.staff_schedules IS 'Staff working schedules by day of week';
COMMENT ON TABLE public.appointments IS 'Patient appointment bookings';
COMMENT ON TABLE public.appointment_types IS 'Configuration for different appointment types';
COMMENT ON TABLE public.staff_capacity IS 'Real-time staff capacity and utilization tracking';
COMMENT ON TABLE public.staff_time_off IS 'Staff time off requests and approved leave';
COMMENT ON TABLE public.booking_rules IS 'Business rules for appointment booking';
COMMENT ON TABLE public.appointment_waitlist IS 'Patient waitlist for appointments';

COMMENT ON FUNCTION calculate_staff_capacity IS 'Calculate and update staff capacity metrics for a given date';
COMMENT ON FUNCTION get_staff_availability IS 'Get available time slots for staff member';
COMMENT ON FUNCTION get_underutilized_staff IS 'Find staff below utilization threshold';
