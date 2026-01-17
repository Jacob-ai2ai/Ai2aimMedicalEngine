-- Migration 009: Pulmonary Function Testing (PFT), Clinic Locations, and Referral Forms
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
