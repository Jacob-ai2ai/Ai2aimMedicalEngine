-- Cron Jobs Setup for AI2AIM RX Platform
-- Run this SQL in Supabase SQL Editor to set up all automated tasks
-- Focus: Productivity workflows and calendar management

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http; -- For making HTTP requests

-- ============================================================================
-- HOURLY PRODUCTIVITY MONITORING (Business Hours: 9 AM - 5 PM)
-- ============================================================================

-- Check staff utilization every hour and send alerts
SELECT cron.schedule(
  'hourly-utilization-check',
  '0 9-17 * * 1-5', -- Every hour, 9 AM - 5 PM, Monday-Friday
  $$
  DO $$
  DECLARE
    alert_record RECORD;
    admin_id UUID;
  BEGIN
    -- Get underutilized staff (below 75%)
    FOR alert_record IN 
      SELECT * FROM get_underutilized_staff(CURRENT_DATE, 75.0)
    LOOP
      -- Insert notification for staff member
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority,
        data
      ) VALUES (
        alert_record.staff_id,
        'utilization_alert',
        'Low Utilization Alert',
        format('You have only %s%% utilization with %s open appointment slots available',
          alert_record.utilization_percentage::INTEGER,
          (alert_record.available_minutes / 30)::INTEGER
        ),
        CASE 
          WHEN alert_record.utilization_percentage < 50 THEN 'high'
          WHEN alert_record.utilization_percentage < 60 THEN 'medium'
          ELSE 'low'
        END,
        jsonb_build_object(
          'utilization', alert_record.utilization_percentage,
          'revenue_potential', alert_record.revenue_potential,
          'available_slots', (alert_record.available_minutes / 30)::INTEGER
        )
      );
    END LOOP;

    -- Notify admin of all underutilized staff
    SELECT id INTO admin_id FROM user_profiles 
    WHERE role = 'admin' AND is_active = TRUE LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority,
        data
      )
      SELECT 
        admin_id,
        'admin_productivity_alert',
        format('%s Staff Members Underutilized', COUNT(*)),
        format('Total potential revenue: $%s', ROUND(SUM(revenue_potential), 2)),
        'high',
        jsonb_build_object(
          'count', COUNT(*),
          'total_revenue_potential', SUM(revenue_potential),
          'date', CURRENT_DATE
        )
      FROM get_underutilized_staff(CURRENT_DATE, 75.0);
    END IF;
  END $$;
  $$
);

-- ============================================================================
-- DAILY CAPACITY RECALCULATION (2 AM)
-- ============================================================================

-- Recalculate capacity for all staff for today and next 7 days
SELECT cron.schedule(
  'daily-capacity-recalculation',
  '0 2 * * *', -- Daily at 2 AM
  $$
  DO $$
  DECLARE
    staff_record RECORD;
    calc_date DATE;
  BEGIN
    -- Loop through next 7 days
    FOR i IN 0..6 LOOP
      calc_date := CURRENT_DATE + i;
      
      -- Recalculate for all active staff
      FOR staff_record IN 
        SELECT id FROM user_profiles 
        WHERE is_active = TRUE 
        AND role IN ('physician', 'nurse', 'administrative')
      LOOP
        PERFORM calculate_staff_capacity(staff_record.id, calc_date);
      END LOOP;
    END LOOP;
  END $$;
  $$
);

-- ============================================================================
-- APPOINTMENT REMINDERS (Daily at 8 AM)
-- ============================================================================

-- Send reminders for appointments in next 24 hours
SELECT cron.schedule(
  'daily-appointment-reminders',
  '0 8 * * *', -- Daily at 8 AM
  $$
  DO $$
  DECLARE
    appt_record RECORD;
  BEGIN
    -- Get appointments for tomorrow that haven't been reminded
    FOR appt_record IN
      SELECT 
        a.id,
        a.patient_id,
        a.appointment_date,
        a.start_time,
        p.email,
        p.phone,
        up.full_name as staff_name,
        at.name as appointment_type
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN user_profiles up ON a.staff_id = up.id
      JOIN appointment_types at ON a.appointment_type_id = at.id
      WHERE a.appointment_date = CURRENT_DATE + 1
        AND a.status IN ('scheduled', 'confirmed')
        AND a.email_reminder_sent = FALSE
    LOOP
      -- Insert notification
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority,
        data
      ) VALUES (
        appt_record.patient_id,
        'appointment_reminder',
        'Appointment Reminder - Tomorrow',
        format('Your %s appointment with %s is tomorrow at %s',
          appt_record.appointment_type,
          appt_record.staff_name,
          appt_record.start_time::TEXT
        ),
        'high',
        jsonb_build_object(
          'appointment_id', appt_record.id,
          'date', appt_record.appointment_date,
          'time', appt_record.start_time
        )
      );

      -- Mark as reminded
      UPDATE appointments 
      SET email_reminder_sent = TRUE,
          email_reminder_sent_at = NOW()
      WHERE id = appt_record.id;
    END LOOP;
  END $$;
  $$
);

-- ============================================================================
-- NO-SHOW DETECTION (Hourly during business hours)
-- ============================================================================

-- Detect no-shows for appointments that passed without check-in
SELECT cron.schedule(
  'no-show-detection',
  '0 9-18 * * 1-5', -- Every hour 9 AM - 6 PM, Monday-Friday
  $$
  UPDATE appointments
  SET status = 'no_show',
      no_show_reason = 'Patient did not arrive for scheduled appointment',
      updated_at = NOW()
  WHERE appointment_date = CURRENT_DATE
    AND start_time < CURRENT_TIME - INTERVAL '15 minutes'
    AND status IN ('scheduled', 'confirmed')
    AND checked_in_at IS NULL;
  $$
);

-- ============================================================================
-- WEEKLY PRODUCTIVITY REPORT (Monday 6 AM)
-- ============================================================================

-- Generate and send weekly productivity reports
SELECT cron.schedule(
  'weekly-productivity-report',
  '0 6 * * 1', -- Monday at 6 AM
  $$
  DO $$
  DECLARE
    report_data JSONB;
    admin_record RECORD;
  BEGIN
    -- Calculate last week's metrics
    WITH week_metrics AS (
      SELECT 
        COUNT(DISTINCT staff_id) as total_staff,
        AVG(utilization_percentage) as avg_utilization,
        SUM(appointments_scheduled) as total_appointments,
        SUM(appointments_completed) as total_completed,
        SUM(no_shows) as total_no_shows,
        SUM(revenue_actual) as total_revenue
      FROM staff_capacity
      WHERE date >= CURRENT_DATE - 7
        AND date < CURRENT_DATE
    )
    SELECT jsonb_build_object(
      'period_start', CURRENT_DATE - 7,
      'period_end', CURRENT_DATE - 1,
      'metrics', row_to_json(week_metrics.*)
    ) INTO report_data
    FROM week_metrics;

    -- Send report to all admins
    FOR admin_record IN
      SELECT id FROM user_profiles WHERE role = 'admin' AND is_active = TRUE
    LOOP
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority,
        data
      ) VALUES (
        admin_record.id,
        'weekly_report',
        'Weekly Productivity Report',
        format('Last week: %s%% avg utilization, %s appointments, $%s revenue',
          ROUND((report_data->'metrics'->>'avg_utilization')::NUMERIC, 1),
          (report_data->'metrics'->>'total_completed')::INTEGER,
          ROUND((report_data->'metrics'->>'total_revenue')::NUMERIC, 2)
        ),
        'medium',
        report_data
      );
    END LOOP;
  END $$;
  $$
);

-- ============================================================================
-- WAITLIST PROCESSING (Every 30 minutes during business hours)
-- ============================================================================

-- Process waitlist and match with newly available slots
SELECT cron.schedule(
  'waitlist-processing',
  '*/30 9-17 * * 1-5', -- Every 30 minutes, 9 AM - 5 PM, Monday-Friday
  $$
  DO $$
  DECLARE
    waitlist_record RECORD;
    available_slot RECORD;
  BEGIN
    -- Get high-priority waitlist entries
    FOR waitlist_record IN
      SELECT 
        w.*,
        p.email,
        p.phone
      FROM appointment_waitlist w
      JOIN patients p ON w.patient_id = p.id
      WHERE w.status = 'waiting'
        AND (w.urgency IN ('urgent', 'high') OR w.priority_score > 70)
      ORDER BY w.priority_score DESC, w.created_at ASC
      LIMIT 10
    LOOP
      -- Find available slot matching preferences
      SELECT * INTO available_slot
      FROM get_staff_availability(
        COALESCE(waitlist_record.preferred_staff_id, 
          (SELECT id FROM user_profiles WHERE role = 'physician' LIMIT 1)),
        COALESCE(waitlist_record.preferred_date, CURRENT_DATE + 1),
        30
      )
      WHERE available = TRUE
      LIMIT 1;

      IF available_slot.available THEN
        -- Send booking offer notification
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          priority,
          data
        ) VALUES (
          waitlist_record.patient_id,
          'appointment_offer',
          'Appointment Slot Available',
          format('An appointment slot is now available on %s at %s. Book within 2 hours.',
            waitlist_record.preferred_date,
            available_slot.start_time
          ),
          'high',
          jsonb_build_object(
            'waitlist_id', waitlist_record.id,
            'slot_date', waitlist_record.preferred_date,
            'slot_time', available_slot.start_time,
            'expires_at', NOW() + INTERVAL '2 hours'
          )
        );

        -- Update waitlist status
        UPDATE appointment_waitlist
        SET status = 'offered',
            offered_slot_time = NOW(),
            offer_expires_at = NOW() + INTERVAL '2 hours'
        WHERE id = waitlist_record.id;
      END IF;
    END LOOP;
  END $$;
  $$
);

-- ============================================================================
-- CALENDAR OPTIMIZATION (Daily at 3 AM)
-- ============================================================================

-- Optimize calendar by identifying and fixing gaps
SELECT cron.schedule(
  'calendar-optimization',
  '0 3 * * *', -- Daily at 3 AM
  $$
  DO $$
  DECLARE
    staff_record RECORD;
    gap_minutes INTEGER;
  BEGIN
    -- Find staff with scheduling gaps (large gaps between appointments)
    FOR staff_record IN
      WITH appointment_gaps AS (
        SELECT 
          staff_id,
          appointment_date,
          start_time,
          LAG(end_time) OVER (PARTITION BY staff_id, appointment_date ORDER BY start_time) as prev_end,
          EXTRACT(EPOCH FROM (start_time - LAG(end_time) OVER (PARTITION BY staff_id, appointment_date ORDER BY start_time)))/60 as gap_minutes
        FROM appointments
        WHERE appointment_date >= CURRENT_DATE
          AND status IN ('scheduled', 'confirmed')
      )
      SELECT DISTINCT staff_id
      FROM appointment_gaps
      WHERE gap_minutes > 60 -- Gaps larger than 1 hour
    LOOP
      -- Create notification for staff to review schedule
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        priority
      ) VALUES (
        staff_record.staff_id,
        'schedule_optimization',
        'Schedule Optimization Needed',
        'You have scheduling gaps that could be filled with additional appointments',
        'low'
      );
    END LOOP;
  END $$;
  $$
);

-- ============================================================================
-- EXPIRED OFFERS CLEANUP (Every 2 hours)
-- ============================================================================

-- Clean up expired waitlist offers
SELECT cron.schedule(
  'cleanup-expired-offers',
  '0 */2 * * *', -- Every 2 hours
  $$
  UPDATE appointment_waitlist
  SET status = 'waiting',
      offered_slot_time = NULL,
      offer_expires_at = NULL
  WHERE status = 'offered'
    AND offer_expires_at < NOW();
  $$
);

-- ============================================================================
-- DATA CLEANUP (Daily at 1 AM)
-- ============================================================================

-- Clean up old completed AI sessions
SELECT cron.schedule(
  'cleanup-ai-sessions',
  '0 1 * * *', -- Daily at 1 AM
  $$
  DELETE FROM ai_sessions 
  WHERE status = 'completed' 
    AND completed_at < NOW() - INTERVAL '7 days';
  $$
);

-- Clean up old notifications (keep 30 days)
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 1 * * *', -- Daily at 1 AM
  $$
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND read_at IS NOT NULL;
  $$
);

-- ============================================================================
-- VIEW ALL CRON JOBS
-- ============================================================================

-- Query to see all active cron jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
ORDER BY jobname;

-- ============================================================================
-- HELPFUL COMMANDS
-- ============================================================================

-- To unschedule a job:
-- SELECT cron.unschedule('job-name');

-- To manually run a job:
-- SELECT cron.alter_job(jobid, schedule := 'now');

-- To disable a job:
-- SELECT cron.alter_job(jobid, active := false);

-- To enable a job:
-- SELECT cron.alter_job(jobid, active := true);

COMMENT ON EXTENSION pg_cron IS 'Cron-based job scheduler for PostgreSQL';
