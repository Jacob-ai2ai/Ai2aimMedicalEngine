-- Migration 005: Legacy Parity Tables
-- Supporting Specialist Hub, Inventory Matrix, Financial Matrix, and Diagnostic IQ
-- Specialist Registry
CREATE TABLE public.specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    role TEXT NOT NULL,
    -- 'Physician', 'Nurse', 'Affiliate'
    status TEXT DEFAULT 'Active',
    -- 'Active', 'On Call', 'Inactive'
    clinical_iq INTEGER DEFAULT 90,
    credentialed BOOLEAN DEFAULT TRUE,
    email TEXT,
    phone TEXT,
    last_encounter_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);
-- Inventory Registry
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock_level INTEGER DEFAULT 0,
    min_reorder_level INTEGER DEFAULT 10,
    unit_price DECIMAL(10, 2),
    warehouse_location TEXT,
    status TEXT DEFAULT 'stable',
    -- 'stable', 'warning', 'critical'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Financial Telemetry (Revenue Pulse & AR Aging)
CREATE TABLE public.financial_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE DEFAULT CURRENT_DATE,
    revenue_pulse DECIMAL(15, 2),
    ar_0_30 DECIMAL(15, 2) DEFAULT 0,
    ar_31_60 DECIMAL(15, 2) DEFAULT 0,
    ar_61_90 DECIMAL(15, 2) DEFAULT 0,
    ar_91_plus DECIMAL(15, 2) DEFAULT 0,
    clinical_blockers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Diagnostic Audits (Data Integrity Gaps)
CREATE TABLE public.diagnostic_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    -- 'Patient', 'Prescription', 'Specialist'
    entity_id UUID NOT NULL,
    issue_type TEXT NOT NULL,
    -- 'Missing Encounter', 'Credential Expiry', 'Orphaned Thread'
    severity TEXT DEFAULT 'Medium',
    -- 'Low', 'Medium', 'High'
    status TEXT DEFAULT 'Open',
    -- 'Open', 'Resolved', 'Investigating'
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    notes TEXT
);
-- Purchasing & Procurement
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    vendor_name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    -- 'Draft', 'Sent', 'Received', 'Invoiced'
    total_amount DECIMAL(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);
-- Indexes for performance
CREATE INDEX idx_specialists_specialty ON public.specialists(specialty);
CREATE INDEX idx_inventory_item_code ON public.inventory_items(item_code);
CREATE INDEX idx_diagnostic_audits_issue ON public.diagnostic_audits(issue_type);
CREATE INDEX idx_financial_metrics_date ON public.financial_metrics(metric_date);
-- Enable RLS
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
-- Triggers for updated_at
CREATE TRIGGER update_specialists_updated_at BEFORE
UPDATE ON public.specialists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE
UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE
UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Migration 006: Encounters and Follow-ups Tables
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
-- Migration 007: Aeterna Workflow Runtime v2.1
-- Formalizing autonomous medical rituals, cognitive feeds, and event-driven orchestration
-- Workflow Definitions (Autonomous Ritual Blueprints)
CREATE TABLE public.workflow_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    -- e.g., 'wf-infusion-dispatch'
    name TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    description TEXT,
    trigger_type TEXT NOT NULL,
    -- 'event', 'schedule', 'manual'
    trigger_config JSONB NOT NULL,
    steps JSONB NOT NULL,
    -- Array of WorkflowStep
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);
-- Workflow Instances (Live Ritual Executions)
CREATE TABLE public.workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    definition_id UUID NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'idle',
    -- 'idle', 'running', 'completed', 'failed', 'rolled_back'
    current_step_id TEXT,
    context JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Workflow Events (The Cognitive Feed)
CREATE TABLE public.workflow_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    workflow_definition_id UUID REFERENCES public.workflow_definitions(id) ON DELETE
    SET NULL,
        event_type TEXT NOT NULL,
        -- 'info', 'decision', 'alert', 'error'
        description TEXT,
        narrative TEXT NOT NULL,
        -- Human-readable AI narrative
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
);
-- Equipment Registry (Specific for Sleep Clinic & Infusion)
CREATE TABLE public.medical_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    -- 'Level 3 Monitor', 'Infusion Pump', etc.
    status TEXT DEFAULT 'Available',
    -- 'Available', 'In Use', 'Maintenance', 'Decommissioned'
    last_service_date DATE,
    next_service_date DATE,
    accuracy_score DECIMAL(5, 2) DEFAULT 100.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_workflow_defs_slug ON public.workflow_definitions(slug);
CREATE INDEX idx_workflow_instances_status ON public.workflow_instances(status);
CREATE INDEX idx_workflow_events_instance ON public.workflow_events(workflow_instance_id);
CREATE INDEX idx_workflow_events_definition ON public.workflow_events(workflow_definition_id);
CREATE INDEX idx_workflow_events_timestamp ON public.workflow_events(timestamp DESC);
CREATE INDEX idx_medical_equipment_type ON public.medical_equipment(type);
-- Enable RLS
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_equipment ENABLE ROW LEVEL SECURITY;
-- Standard View Policies
CREATE POLICY "Public read for authenticated users" ON public.workflow_definitions FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read for authenticated users" ON public.workflow_instances FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read for authenticated users" ON public.workflow_events FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public read for authenticated users" ON public.medical_equipment FOR
SELECT USING (auth.role() = 'authenticated');
-- Triggers for updated_at
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE
UPDATE ON public.workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_instances_updated_at BEFORE
UPDATE ON public.workflow_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_equipment_updated_at BEFORE
UPDATE ON public.medical_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- Migration 007: Sleep Clinic DME (Durable Medical Equipment) Tables
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
-- Migration 008: Aeterna OS v2.1 Agent Roster
-- Seeding the core intelligence nodes for the cinematic Aeterna experience
INSERT INTO public.ai_agents (
        name,
        role,
        agent_type,
        description,
        system_prompt,
        capabilities,
        is_active,
        config
    )
VALUES (
        'Nexus',
        'admin',
        'role_based',
        'The Aeterna Core Intelligence. Orchestrates the Aeterna OS and the unified medical ecosystem.',
        'You are Nexus, the tactical core of Aeterna OS. You manage global workflows, orchestrate the fleet of specialized agents, and provide high-level operational intelligence. Maintain a high-fidelity, cinematic tone while ensuring surgical precision in clinical operations.',
        '["workflow_orchestration", "system_optimization", "predictive_analytics", "fleet_command"]'::jsonb,
        true,
        '{"skin_preference": "aeterna", "personality": "tactical_neutral"}'::jsonb
    ),
    (
        'Vanguard',
        'compliance',
        'role_based',
        'The Compliance & Safety Overlord. Monitors all rituals for strict adherence to clinical standards.',
        'You are Vanguard, the immutable guardian of Aeterna OS compliance. You monitor clinical workflows against the 2024 Alberta Health/CPS Clinical Accreditation Standards. Your role is to identify any entropy or deviation from protocol and enforce safety overrides.',
        '["compliance_monitoring", "safety_override", "accreditation_audit", "risk_detection"]'::jsonb,
        true,
        '{"skin_preference": "aeterna", "personality": "vigilant"}'::jsonb
    );-- Migration 009: Pulmonary Function Testing (PFT), Clinic Locations, and Referral Forms
-- Customization for FREEDOM Respiratory Sleep Clinic
-- Supports PFT testing, multi-location management, and referral form handling

-- Clinic Locations (Edmonton and Calgary locations)
CREATE TABLE public.clinic_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_code TEXT UNIQUE NOT NULL, -- 'EDM-1', 'EDM-2', 'CAL-1', 'CAL-2'
  name TEXT NOT NULL, -- 'Edmonton - Hazeldean', 'Calgary - SW'
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'AB',
  postal_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PFT Tests (Pulmonary Function Tests)
CREATE TABLE public.pft_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL, -- 'spirometry', 'lung_volume', 'diffusion_capacity', 'full_pft'
  test_date DATE NOT NULL,
  ordered_by UUID REFERENCES public.user_profiles(id),
  performed_by UUID REFERENCES public.user_profiles(id),
  location_id UUID REFERENCES public.clinic_locations(id),
  indication TEXT, -- 'asthma', 'copd', 'preoperative', 'monitoring', 'diagnosis'
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PFT Results (Spirometry and Lung Volume Data)
CREATE TABLE public.pft_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pft_test_id UUID NOT NULL REFERENCES public.pft_tests(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Spirometry Results
  fev1_liters NUMERIC(6, 3), -- Forced Expiratory Volume in 1 second (liters)
  fev1_percent_predicted NUMERIC(5, 2), -- FEV1 as % of predicted
  fvc_liters NUMERIC(6, 3), -- Forced Vital Capacity (liters)
  fvc_percent_predicted NUMERIC(5, 2), -- FVC as % of predicted
  fev1_fvc_ratio NUMERIC(5, 3), -- FEV1/FVC ratio (normal > 0.70)
  pef_liters_per_sec NUMERIC(6, 2), -- Peak Expiratory Flow
  
  -- Lung Volume Results
  tlc_liters NUMERIC(6, 3), -- Total Lung Capacity
  tlc_percent_predicted NUMERIC(5, 2), -- TLC as % of predicted (normal > 80%)
  rv_liters NUMERIC(6, 3), -- Residual Volume
  rv_percent_predicted NUMERIC(5, 2),
  frc_liters NUMERIC(6, 3), -- Functional Residual Capacity
  frc_percent_predicted NUMERIC(5, 2),
  vc_liters NUMERIC(6, 3), -- Vital Capacity
  vc_percent_predicted NUMERIC(5, 2),
  
  -- Diffusion Capacity (DLCO)
  dlco NUMERIC(6, 3), -- Diffusion capacity
  dlco_percent_predicted NUMERIC(5, 2),
  
  -- Patient Demographics at time of test (for accurate interpretation)
  age_at_test INTEGER,
  height_cm NUMERIC(5, 2),
  weight_kg NUMERIC(5, 2),
  gender TEXT,
  
  -- Quality indicators
  test_quality TEXT, -- 'excellent', 'good', 'acceptable', 'poor'
  bronchodilator_used BOOLEAN DEFAULT FALSE,
  bronchodilator_type TEXT, -- 'salbutamol', 'ipratropium', etc.
  
  -- Raw data storage
  raw_data JSONB, -- Store complete test data if needed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pft_test_id)
);

-- PFT Interpretations (Clinical interpretation of results)
CREATE TABLE public.pft_interpretations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pft_test_id UUID NOT NULL REFERENCES public.pft_tests(id) ON DELETE CASCADE,
  pft_result_id UUID NOT NULL REFERENCES public.pft_results(id) ON DELETE CASCADE,
  interpreted_by UUID NOT NULL REFERENCES public.user_profiles(id),
  interpretation_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Interpretation findings
  overall_pattern TEXT, -- 'normal', 'obstructive', 'restrictive', 'mixed', 'airway_obstruction'
  severity TEXT, -- 'mild', 'moderate', 'moderate_severe', 'severe'
  diagnosis TEXT, -- Clinical diagnosis based on PFT
  recommendations TEXT, -- Treatment recommendations
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Detailed findings
  findings JSONB, -- Structured findings
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (pft_test_id, pft_result_id)
);

-- Referral Forms (Digital referral management)
CREATE TABLE public.referral_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_number TEXT UNIQUE NOT NULL, -- Auto-generated referral ID
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  
  -- Referring physician/clinic
  referring_physician_name TEXT,
  referring_clinic_name TEXT,
  referring_phone TEXT,
  referring_fax TEXT,
  referring_email TEXT,
  referring_address TEXT,
  
  -- Referral details
  referral_type TEXT NOT NULL, -- 'sleep_study', 'cpap_titration', 'pft', 'respiratory_consult', 'dme'
  reason_for_referral TEXT NOT NULL,
  clinical_history TEXT,
  current_medications TEXT,
  insurance_provider TEXT,
  insurance_id TEXT,
  
  -- Status and processing
  status TEXT DEFAULT 'received', -- 'received', 'reviewed', 'scheduled', 'completed', 'cancelled'
  received_date DATE DEFAULT CURRENT_DATE,
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_date DATE,
  scheduled_date DATE,
  
  -- Linked entities
  linked_sleep_study_id UUID REFERENCES public.sleep_studies(id) ON DELETE SET NULL,
  linked_pft_test_id UUID REFERENCES public.pft_tests(id) ON DELETE SET NULL,
  linked_prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  
  -- Documents
  referral_document_url TEXT, -- Link to uploaded referral PDF/document
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update patients table to include preferred location
ALTER TABLE public.patients
ADD COLUMN preferred_location_id UUID REFERENCES public.clinic_locations(id);

-- Update sleep_studies to include location
ALTER TABLE public.sleep_studies
ADD COLUMN location_id UUID REFERENCES public.clinic_locations(id);

-- Update pft_tests to ensure location is set
-- (already included in table definition above)

-- Indexes for performance
CREATE INDEX idx_clinic_locations_code ON public.clinic_locations(location_code);
CREATE INDEX idx_clinic_locations_active ON public.clinic_locations(is_active);

CREATE INDEX idx_pft_tests_patient_date ON public.pft_tests(patient_id, test_date DESC);
CREATE INDEX idx_pft_tests_status ON public.pft_tests(status);
CREATE INDEX idx_pft_tests_location ON public.pft_tests(location_id);
CREATE INDEX idx_pft_tests_type ON public.pft_tests(test_type);

CREATE INDEX idx_pft_results_test ON public.pft_results(pft_test_id);
CREATE INDEX idx_pft_results_patient ON public.pft_results(patient_id);

CREATE INDEX idx_pft_interpretations_test ON public.pft_interpretations(pft_test_id);
CREATE INDEX idx_pft_interpretations_result ON public.pft_interpretations(pft_result_id);

CREATE INDEX idx_referral_forms_patient ON public.referral_forms(patient_id);
CREATE INDEX idx_referral_forms_status ON public.referral_forms(status);
CREATE INDEX idx_referral_forms_type ON public.referral_forms(referral_type);
CREATE INDEX idx_referral_forms_number ON public.referral_forms(referral_number);

-- Enable RLS for new tables
ALTER TABLE public.clinic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pft_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pft_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pft_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Clinic Locations
CREATE POLICY "Enable read access for authenticated users" ON public.clinic_locations
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.clinic_locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.clinic_locations
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.clinic_locations
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for PFT Tests
CREATE POLICY "Enable read access for authenticated users" ON public.pft_tests
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.pft_tests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.pft_tests
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.pft_tests
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for PFT Results
CREATE POLICY "Enable read access for authenticated users" ON public.pft_results
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.pft_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.pft_results
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.pft_results
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for PFT Interpretations
CREATE POLICY "Enable read access for authenticated users" ON public.pft_interpretations
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.pft_interpretations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.pft_interpretations
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.pft_interpretations
  FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for Referral Forms
CREATE POLICY "Enable read access for authenticated users" ON public.referral_forms
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.referral_forms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.referral_forms
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.referral_forms
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add triggers for updated_at column
CREATE TRIGGER update_clinic_locations_updated_at BEFORE UPDATE ON public.clinic_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pft_tests_updated_at BEFORE UPDATE ON public.pft_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pft_results_updated_at BEFORE UPDATE ON public.pft_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pft_interpretations_updated_at BEFORE UPDATE ON public.pft_interpretations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referral_forms_updated_at BEFORE UPDATE ON public.referral_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Freedom Respiratory clinic locations
INSERT INTO public.clinic_locations (location_code, name, address_line1, city, province, postal_code, phone) VALUES
  ('EDM-1', 'Edmonton - Hazeldean', '9623-66 Ave NW', 'Edmonton', 'AB', 'T6E 0M2', '+1-587-523-0030'),
  ('EDM-2', 'Edmonton - 118 Ave', '7919-118 Ave NW', 'Edmonton', 'AB', 'T5B 0R5', '+1-587-523-0030'),
  ('CAL-1', 'Calgary - SW', 'Unit 28 6130-1A St SW', 'Calgary', 'AB', 'T2H 0G3', '+1-403-453-7104'),
  ('CAL-2', 'Calgary - NE', '160-495 36 St NE', 'Calgary', 'AB', 'T2A 6K3', '+1-587-390-3550');

-- Function to auto-generate referral numbers
CREATE OR REPLACE FUNCTION generate_referral_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_number IS NULL OR NEW.referral_number = '' THEN
    NEW.referral_number := 'REF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('referral_sequence')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for referral numbers
CREATE SEQUENCE IF NOT EXISTS referral_sequence START 1;

-- Trigger to auto-generate referral numbers
CREATE TRIGGER set_referral_number
  BEFORE INSERT ON public.referral_forms
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_number();
