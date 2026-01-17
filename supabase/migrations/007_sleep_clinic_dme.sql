-- Migration 007: Sleep Clinic DME (Durable Medical Equipment) Tables
-- Customization for FREEDOM Respiratory Sleep Clinic
-- Supports CPAP/BiPAP equipment management, compliance monitoring, and sleep studies

-- DME Equipment Catalog
CREATE TABLE public.dme_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cpap', 'bipap', 'mask', 'supply', 'monitor'
  manufacturer TEXT,
  model TEXT,
  description TEXT,
  unit_cost DECIMAL(10, 2),
  rental_rate_monthly DECIMAL(10, 2),
  requires_prescription BOOLEAN DEFAULT TRUE,
  insurance_code TEXT, -- HCPCS code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DME Equipment Inventory (with serial numbers)
CREATE TABLE public.dme_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES public.dme_equipment(id) ON DELETE CASCADE,
  serial_number TEXT UNIQUE,
  status TEXT DEFAULT 'available', -- 'available', 'assigned', 'maintenance', 'retired'
  assigned_to_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  purchase_date DATE,
  warranty_expires DATE,
  location TEXT, -- warehouse location
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DME Prescriptions (extends prescriptions)
CREATE TABLE public.dme_prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.dme_equipment(id),
  rental_or_purchase TEXT DEFAULT 'rental', -- 'rental', 'purchase'
  duration_months INTEGER, -- for rentals
  insurance_authorization_number TEXT,
  authorization_expires DATE,
  delivery_address TEXT,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CPAP Compliance Data
CREATE TABLE public.cpap_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dme_prescription_id UUID REFERENCES public.dme_prescriptions(id) ON DELETE SET NULL,
  equipment_serial_number TEXT,
  compliance_period_start DATE NOT NULL,
  compliance_period_end DATE NOT NULL,
  days_used INTEGER DEFAULT 0,
  days_required INTEGER DEFAULT 21, -- typically 21 of 30 days
  average_hours_per_night DECIMAL(4, 2),
  compliance_percentage DECIMAL(5, 2),
  meets_insurance_requirements BOOLEAN DEFAULT FALSE,
  data_source TEXT, -- 'manual', 'resmed_cloud', 'philips_care', 'api'
  raw_data JSONB, -- device-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep Studies
CREATE TABLE public.sleep_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  study_type TEXT NOT NULL, -- 'level3_home', 'level1_psg', 'level2_home'
  study_date DATE,
  ordered_by UUID REFERENCES public.user_profiles(id),
  monitor_serial_number TEXT,
  status TEXT DEFAULT 'ordered', -- 'ordered', 'dispatched', 'in_progress', 'completed', 'interpreted'
  dispatch_date DATE,
  return_date DATE,
  interpretation_date DATE,
  interpreted_by UUID REFERENCES public.user_profiles(id),
  results JSONB, -- AHI, RDI, oxygen levels, etc.
  diagnosis TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_dme_equipment_category ON public.dme_equipment(category);
CREATE INDEX idx_dme_equipment_code ON public.dme_equipment(equipment_code);
CREATE INDEX idx_dme_inventory_equipment ON public.dme_inventory(equipment_id);
CREATE INDEX idx_dme_inventory_serial ON public.dme_inventory(serial_number);
CREATE INDEX idx_dme_inventory_status ON public.dme_inventory(status) WHERE status = 'available';
CREATE INDEX idx_dme_inventory_patient ON public.dme_inventory(assigned_to_patient_id) WHERE assigned_to_patient_id IS NOT NULL;
CREATE INDEX idx_dme_prescriptions_prescription ON public.dme_prescriptions(prescription_id);
CREATE INDEX idx_dme_prescriptions_equipment ON public.dme_prescriptions(equipment_id);
CREATE INDEX idx_cpap_compliance_patient ON public.cpap_compliance(patient_id, compliance_period_start DESC);
CREATE INDEX idx_cpap_compliance_prescription ON public.cpap_compliance(dme_prescription_id);
CREATE INDEX idx_sleep_studies_patient ON public.sleep_studies(patient_id, study_date DESC);
CREATE INDEX idx_sleep_studies_status ON public.sleep_studies(status) WHERE status IN ('ordered', 'dispatched', 'in_progress');
CREATE INDEX idx_sleep_studies_monitor ON public.sleep_studies(monitor_serial_number) WHERE monitor_serial_number IS NOT NULL;

-- Enable RLS
ALTER TABLE public.dme_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dme_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dme_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpap_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_studies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dme_equipment
CREATE POLICY "Users can view DME equipment"
  ON public.dme_equipment FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins and physicians can manage DME equipment"
  ON public.dme_equipment FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'physician', 'administrative')
    )
  );

-- RLS Policies for dme_inventory
CREATE POLICY "Users can view DME inventory"
  ON public.dme_inventory FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can manage DME inventory"
  ON public.dme_inventory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'physician', 'nurse', 'administrative')
    )
  );

-- RLS Policies for dme_prescriptions
CREATE POLICY "Users can view DME prescriptions for accessible patients"
  ON public.dme_prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions p
      JOIN public.patients pat ON p.patient_id = pat.id
      WHERE p.id = dme_prescriptions.prescription_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR pat.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

CREATE POLICY "Users can create DME prescriptions for accessible patients"
  ON public.dme_prescriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prescriptions p
      JOIN public.patients pat ON p.patient_id = pat.id
      WHERE p.id = dme_prescriptions.prescription_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'administrative')
        )
      )
    )
  );

-- RLS Policies for cpap_compliance
CREATE POLICY "Users can view CPAP compliance for accessible patients"
  ON public.cpap_compliance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = cpap_compliance.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

CREATE POLICY "Users can manage CPAP compliance for accessible patients"
  ON public.cpap_compliance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = cpap_compliance.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

-- RLS Policies for sleep_studies
CREATE POLICY "Users can view sleep studies for accessible patients"
  ON public.sleep_studies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = sleep_studies.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

CREATE POLICY "Users can create sleep studies for accessible patients"
  ON public.sleep_studies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE id = sleep_studies.patient_id
      AND (
        EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN ('physician', 'nurse', 'administrative')
        )
      )
    )
  );

CREATE POLICY "Users can update sleep studies they created or are assigned to"
  ON public.sleep_studies FOR UPDATE
  USING (
    ordered_by = auth.uid()
    OR interpreted_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add DME flag to prescriptions table
ALTER TABLE public.prescriptions 
ADD COLUMN IF NOT EXISTS is_dme BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dme_category TEXT; -- 'cpap', 'bipap', 'supply', etc.

-- Add sleep-specific fields to patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS primary_sleep_diagnosis TEXT,
ADD COLUMN IF NOT EXISTS ahi_score DECIMAL(5, 2), -- Apnea-Hypopnea Index
ADD COLUMN IF NOT EXISTS cpap_titration_date DATE;

-- Triggers for updated_at
CREATE TRIGGER update_dme_equipment_updated_at BEFORE
UPDATE ON public.dme_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dme_inventory_updated_at BEFORE
UPDATE ON public.dme_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dme_prescriptions_updated_at BEFORE
UPDATE ON public.dme_prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpap_compliance_updated_at BEFORE
UPDATE ON public.cpap_compliance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sleep_studies_updated_at BEFORE
UPDATE ON public.sleep_studies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
