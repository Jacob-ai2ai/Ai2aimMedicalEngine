-- Migration 006: Encounters and Follow-ups Tables
-- Supporting FR-013 (Clinical Follow-up Monitoring), FR-014 (Revenue Telemetry), and FR-016 (Diagnostic IQ)

-- Encounters table for tracking patient visits
CREATE TABLE public.encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_date TIMESTAMPTZ NOT NULL,
  encounter_type TEXT DEFAULT 'visit',
  -- 'visit', 'consultation', 'follow-up', 'emergency'
  provider_id UUID REFERENCES public.user_profiles(id),
  specialist_id UUID REFERENCES public.specialists(id),
  diagnosis TEXT,
  notes TEXT,
  billing_status TEXT DEFAULT 'unbilled',
  -- 'unbilled', 'billed', 'paid', 'partial'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Follow-ups table for tracking required follow-up interventions
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES public.encounters(id) ON DELETE SET NULL,
  follow_up_type TEXT NOT NULL,
  -- '72h', '3m', '6m'
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  -- 'pending', 'completed', 'overdue', 'cancelled'
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.user_profiles(id)
);

-- Indexes for performance
CREATE INDEX idx_encounters_patient_date ON public.encounters(patient_id, encounter_date DESC);
CREATE INDEX idx_encounters_billing_status ON public.encounters(billing_status) WHERE billing_status = 'unbilled';
CREATE INDEX idx_encounters_provider ON public.encounters(provider_id);
CREATE INDEX idx_encounters_date ON public.encounters(encounter_date DESC);

CREATE INDEX idx_follow_ups_patient_due ON public.follow_ups(patient_id, due_date, status);
CREATE INDEX idx_follow_ups_status ON public.follow_ups(status) WHERE status = 'pending';
CREATE INDEX idx_follow_ups_due_date ON public.follow_ups(due_date) WHERE status = 'pending';
CREATE INDEX idx_follow_ups_encounter ON public.follow_ups(encounter_id);

-- Enable RLS
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for encounters
-- Users can view encounters for patients they have access to
CREATE POLICY "Users can view encounters for accessible patients"
  ON public.encounters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = encounters.patient_id
      AND (
        -- Admin can see all
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR
        -- Provider can see their own encounters
        encounters.provider_id = auth.uid()
        OR
        -- Users with patient access can see encounters
        patients.created_by = auth.uid()
      )
    )
  );

-- Users can create encounters for patients they have access to
CREATE POLICY "Users can create encounters for accessible patients"
  ON public.encounters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = encounters.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR
        patients.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

-- Users can update encounters they created or are assigned to
CREATE POLICY "Users can update their encounters"
  ON public.encounters FOR UPDATE
  USING (
    provider_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for follow_ups
-- Users can view follow-ups for patients they have access to
CREATE POLICY "Users can view follow-ups for accessible patients"
  ON public.follow_ups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = follow_ups.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR
        patients.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

-- Users can create follow-ups for patients they have access to
CREATE POLICY "Users can create follow-ups for accessible patients"
  ON public.follow_ups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = follow_ups.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR
        patients.created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

-- Users can update follow-ups they created
CREATE POLICY "Users can update their follow-ups"
  ON public.follow_ups FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('physician', 'nurse')
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_encounters_updated_at BEFORE
UPDATE ON public.encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at BEFORE
UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
