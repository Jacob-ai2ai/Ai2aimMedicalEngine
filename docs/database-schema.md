# Database Schema Documentation

## Overview

The database uses PostgreSQL via Supabase with the following schema:

## Tables

### user_profiles

User account information (extends Supabase auth.users).

**Columns**:

- `id` (UUID, PK) - References auth.users
- `email` (TEXT, UNIQUE) - User email
- `full_name` (TEXT) - User's full name
- `role` (user_role) - User role enum
- `phone` (TEXT) - Phone number
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:

- Primary key on `id`
- Unique index on `email`

### patients

Patient medical records.

**Columns**:

- `id` (UUID, PK) - Primary key
- `patient_id` (TEXT, UNIQUE) - Patient identifier
- `first_name` (TEXT) - First name
- `last_name` (TEXT) - Last name
- `date_of_birth` (DATE) - Date of birth
- `gender` (TEXT) - Gender
- `phone` (TEXT) - Phone number
- `email` (TEXT) - Email address
- `address_line1` (TEXT) - Address line 1
- `address_line2` (TEXT) - Address line 2
- `city` (TEXT) - City
- `state` (TEXT) - State
- `zip_code` (TEXT) - ZIP code
- `insurance_provider` (TEXT) - Insurance provider
- `insurance_id` (TEXT) - Insurance ID
- `emergency_contact_name` (TEXT) - Emergency contact name
- `emergency_contact_phone` (TEXT) - Emergency contact phone
- `medical_history` (JSONB) - Medical history data
- `allergies` (JSONB) - Allergies data
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `created_by` (UUID, FK) - User who created record
- `primary_sleep_diagnosis` (TEXT) - Primary sleep diagnosis (from migration 007)
- `ahi_score` (NUMERIC(5, 2)) - AHI (Apnea-Hypopnea Index) score (from migration 007)
- `cpap_titration_date` (DATE) - CPAP titration date (from migration 007)
- `preferred_location_id` (UUID, FK) - Preferred clinic location (from migration 009)

**Indexes**:

- Primary key on `id`
- Unique index on `patient_id`
- Index on `(last_name, first_name)`

### medications

Medication database.

**Columns**:

- `id` (UUID, PK) - Primary key
- `name` (TEXT) - Medication name
- `generic_name` (TEXT) - Generic name
- `dosage_form` (TEXT) - Dosage form
- `strength` (TEXT) - Strength
- `ndc_code` (TEXT, UNIQUE) - NDC code
- `manufacturer` (TEXT) - Manufacturer
- `description` (TEXT) - Description
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:

- Primary key on `id`
- Unique index on `ndc_code`

### prescriptions

Prescription records.

**Columns**:

- `id` (UUID, PK) - Primary key
- `prescription_number` (TEXT, UNIQUE) - Prescription number
- `patient_id` (UUID, FK) - References patients
- `medication_id` (UUID, FK) - References medications
- `dosage` (TEXT) - Dosage instructions
- `quantity` (INTEGER) - Quantity
- `refills` (INTEGER) - Number of refills
- `instructions` (TEXT) - Patient instructions
- `status` (prescription_status) - Status enum
- `prescribed_by` (UUID, FK) - Prescribing user
- `approved_by` (UUID, FK) - Approving user
- `filled_by` (UUID, FK) - Filling user
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `filled_at` (TIMESTAMPTZ) - Fill timestamp
- `expires_at` (TIMESTAMPTZ) - Expiration timestamp

**Indexes**:

- Primary key on `id`
- Unique index on `prescription_number`
- Index on `patient_id`
- Index on `status`

### communications

Letters, messages, referrals.

**Columns**:

- `id` (UUID, PK) - Primary key
- `communication_type` (communication_type) - Type enum
- `direction` (communication_direction) - Direction enum
- `subject` (TEXT) - Subject line
- `content` (TEXT) - Content
- `patient_id` (UUID, FK) - References patients
- `from_user_id` (UUID, FK) - Sender user
- `to_user_id` (UUID, FK) - Recipient user
- `related_prescription_id` (UUID, FK) - Related prescription
- `metadata` (JSONB) - Additional metadata
- `is_read` (BOOLEAN) - Read status
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:

- Primary key on `id`
- Index on `patient_id`
- Index on `communication_type`

### ai_agents

AI agent configurations.

**Columns**:

- `id` (UUID, PK) - Primary key
- `name` (TEXT) - Agent name
- `role` (user_role) - Associated role
- `agent_type` (TEXT) - 'role_based' or 'encoding'
- `description` (TEXT) - Description
- `system_prompt` (TEXT) - System prompt
- `capabilities` (JSONB) - Capabilities array
- `is_active` (BOOLEAN) - Active status
- `config` (JSONB) - Configuration
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### ai_sessions

AI agent interaction sessions.

**Columns**:

- `id` (UUID, PK) - Primary key
- `agent_id` (UUID, FK) - References ai_agents
- `user_id` (UUID, FK) - User in session
- `context` (JSONB) - Session context
- `messages` (JSONB) - Message history
- `status` (TEXT) - Session status
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `completed_at` (TIMESTAMPTZ) - Completion timestamp

**Indexes**:

- Primary key on `id`
- Index on `agent_id`
- Index on `user_id`

### automations

Automation definitions.

**Columns**:

- `id` (UUID, PK) - Primary key
- `name` (TEXT) - Automation name
- `description` (TEXT) - Description
- `trigger_type` (automation_trigger_type) - Trigger type enum
- `trigger_config` (JSONB) - Trigger configuration
- `action_type` (automation_action_type) - Action type enum
- `action_config` (JSONB) - Action configuration
- `is_active` (BOOLEAN) - Active status
- `priority` (INTEGER) - Execution priority
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp
- `created_by` (UUID, FK) - Creator user

### automation_runs

Automation execution logs.

**Columns**:

- `id` (UUID, PK) - Primary key
- `automation_id` (UUID, FK) - References automations
- `status` (TEXT) - 'success', 'failed', 'running'
- `input_data` (JSONB) - Input data
- `output_data` (JSONB) - Output data
- `error_message` (TEXT) - Error message if failed
- `started_at` (TIMESTAMPTZ) - Start timestamp
- `completed_at` (TIMESTAMPTZ) - Completion timestamp
- `duration_ms` (INTEGER) - Duration in milliseconds

**Indexes**:

- Primary key on `id`
- Index on `automation_id`
- Index on `status`

### specialists

Registry of clinical staff and affiliates.

**Columns**:

- `id` (UUID, PK) - Primary key
- `name` (TEXT) - Full name
- `specialty` (TEXT) - Medical specialty
- `role` (TEXT) - 'Physician', 'Nurse', 'Affiliate'
- `status` (TEXT) - 'Active', 'On Call', 'Inactive'
- `clinical_iq` (INTEGER) - Performance score
- `credentialed` (BOOLEAN) - Credential status
- `email` (TEXT) - Contact email
- `phone` (TEXT) - Contact phone
- `last_encounter_at` (TIMESTAMPTZ) - Last seen
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### inventory_items

Clinical supply and medication stock tracking.

**Columns**:

- `id` (UUID, PK) - Primary key
- `item_code` (TEXT) - Unique SKU/NDC
- `name` (TEXT) - Item name
- `category` (TEXT) - Category (Clinical, Supplies, etc.)
- `stock_level` (INTEGER) - Current quantity
- `min_reorder_level` (INTEGER) - Threshold for alerts
- `unit_price` (DECIMAL) - Cost per unit
- `warehouse_location` (TEXT) - Storage location
- `status` (TEXT) - 'stable', 'warning', 'critical'

### financial_metrics

Daily revenue pulse and AR aging telemetry.

**Columns**:

- `id` (UUID, PK) - Primary key
- `metric_date` (DATE) - Date of record
- `revenue_pulse` (DECIMAL) - Daily revenue
- `ar_0_30` (DECIMAL) - AR aging (0-30 days)
- `ar_31_60` (DECIMAL) - AR aging (31-60 days)
- `ar_61_90` (DECIMAL) - AR aging (61-90 days)
- `ar_91_plus` (DECIMAL) - AR aging (91+ days)
- `clinical_blockers_count` (INTEGER) - Number of unbilled encounters

### diagnostic_audits

System-wide data integrity audit board.

**Columns**:

- `id` (UUID, PK) - Primary key
- `entity_type` (TEXT) - 'Patient', 'Prescription', etc.
- `entity_id` (UUID) - Reference to target
- `issue_type` (TEXT) - 'Missing Encounter', etc.
- `severity` (TEXT) - 'Low', 'Medium', 'High'
- `status` (TEXT) - 'Open', 'Resolved', 'Investigating'
- `detected_at` (TIMESTAMPTZ) - Detection time

### purchase_orders

Procurement tracking records.

**Columns**:

- `id` (UUID, PK) - Primary key
- `po_number` (TEXT) - Unique PO number
- `vendor_name` (TEXT) - Vendor identifier
- `status` (TEXT) - 'Draft', 'Sent', 'Received', etc.
 TOTAL_AMOUNT (DECIMAL) - Total cost

### encounters

Patient-provider clinical interaction records.

**Columns**:

- `id` (UUID, PK) - Primary key
- `patient_id` (UUID, FK) - References patients
- `encounter_date` (TIMESTAMPTZ) - Date of visit
- `encounter_type` (TEXT) - 'visit', 'telehealth', etc.
- `provider_id` (UUID, FK) - References user_profiles
- `specialist_id` (UUID, FK) - References specialists
- `diagnosis` (TEXT) - Diagnostic coding/notes
- `notes` (TEXT) - Clinical notes
- `billing_status` (TEXT) - 'unbilled', 'billed', 'paid'

### follow_ups

Clinical intervention tracking for longitudinal care.

**Columns**:

- `id` (UUID, PK) - Primary key
- `patient_id` (UUID, FK) - References patients
- `encounter_id` (UUID, FK) - References encounters
- `follow_up_type` (TEXT) - '72h', '3m', '6m'
- `due_date` (DATE) - Required intervention date
- `status` (TEXT) - 'pending', 'completed', 'overdue'

### workflow_definitions

Aeterna OS Autonomous Ritual Blueprints.

**Columns**:

- `id` (UUID, PK) - Primary key
- `slug` (TEXT) - Unique identifier (e.g., 'wf-infusion-dispatch')
- `name` (TEXT) - Workflow name
- `trigger_type` (TEXT) - 'event', 'schedule', 'manual'
- `trigger_config` (JSONB) - Trigger constraints
- `steps` (JSONB) - Serialized ritual steps

### workflow_instances

Live executions of Aeterna OS Rituals.

**Columns**:

- `id` (UUID, PK) - Primary key
- `definition_id` (UUID, FK) - References workflow_definitions
- `status` (TEXT) - 'running', 'completed', 'failed'
- `current_step_id` (TEXT) - Pointer to active step
- `context` (JSONB) - Execution state data

### workflow_events

The Cognitive Feed narrative stream.

**Columns**:

- `id` (UUID, PK) - Primary key
- `workflow_instance_id` (UUID, FK) - References workflow_instances
- `event_type` (TEXT) - 'info', 'decision', 'alert'
- `narrative` (TEXT) - Human-readable AI rationale
- `timestamp` (TIMESTAMPTZ) - Event time

### medical_equipment

High-fidelity medical device registry.

**Columns**:

- `id` (UUID, PK) - Primary key
- `asset_id` (TEXT) - Unique serial/asset tag
- `name` (TEXT) - Device name
- `type` (TEXT) - e.g., 'Level 3 Monitor'
- `status` (TEXT) - 'Available', 'In Use', 'Maintenance'
- `accuracy_score` (DECIMAL) - Calibration telemetry

## Enums

### user_role

- `admin`
- `physician`
- `pharmacist`
- `nurse`
- `billing`
- `compliance`
- `administrative`

### prescription_status

- `pending`
- `approved`
- `rejected`
- `filled`
- `dispensed`
- `cancelled`

### communication_type

- `letter`
- `referral`
- `message`
- `notification`

### communication_direction

- `inbound`
- `outbound`

### automation_trigger_type

- `event`
- `schedule`
- `condition`
- `webhook`

### automation_action_type

- `notification`
- `task`
- `api_call`
- `ai_agent`
- `workflow`

### clinic_locations
Clinic location information for multi-location support.

**Columns**:
- `id` (UUID, PK) - Primary key
- `location_code` (TEXT, UNIQUE) - Location code (e.g., 'EDM-1', 'CAL-1')
- `name` (TEXT) - Location name
- `address_line1` (TEXT) - Address line 1
- `address_line2` (TEXT) - Address line 2
- `city` (TEXT) - City
- `province` (TEXT) - Province/State (default 'AB')
- `postal_code` (TEXT) - Postal code
- `phone` (TEXT) - Phone number
- `email` (TEXT) - Email address
- `is_active` (BOOLEAN) - Active status
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Unique index on `location_code`
- Index on `is_active`

### pft_tests
Pulmonary function test scheduling and management.

**Columns**:
- `id` (UUID, PK) - Primary key
- `patient_id` (UUID, FK) - References patients
- `test_type` (TEXT) - Test type: 'spirometry', 'lung_volume', 'diffusion_capacity', 'full_pft'
- `test_date` (DATE) - Scheduled test date
- `ordered_by` (UUID, FK) - User who ordered test
- `performed_by` (UUID, FK) - User who performed test
- `location_id` (UUID, FK) - References clinic_locations
- `indication` (TEXT) - Clinical indication (e.g., 'asthma', 'copd')
- `status` (TEXT) - Status: 'scheduled', 'in_progress', 'completed', 'cancelled'
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Index on `(patient_id, test_date DESC)`
- Index on `status`
- Index on `location_id`
- Index on `test_type`

### pft_results
Pulmonary function test results (spirometry, lung volume, diffusion capacity).

**Columns**:
- `id` (UUID, PK) - Primary key
- `pft_test_id` (UUID, FK) - References pft_tests
- `patient_id` (UUID, FK) - References patients

**Spirometry Results**:
- `fev1_liters` (NUMERIC(6, 3)) - Forced Expiratory Volume in 1 second (liters)
- `fev1_percent_predicted` (NUMERIC(5, 2)) - FEV1 as % of predicted
- `fvc_liters` (NUMERIC(6, 3)) - Forced Vital Capacity (liters)
- `fvc_percent_predicted` (NUMERIC(5, 2)) - FVC as % of predicted
- `fev1_fvc_ratio` (NUMERIC(5, 3)) - FEV1/FVC ratio (normal > 0.70)
- `pef_liters_per_sec` (NUMERIC(6, 2)) - Peak Expiratory Flow

**Lung Volume Results**:
- `tlc_liters` (NUMERIC(6, 3)) - Total Lung Capacity
- `tlc_percent_predicted` (NUMERIC(5, 2)) - TLC as % of predicted (normal > 80%)
- `rv_liters` (NUMERIC(6, 3)) - Residual Volume
- `rv_percent_predicted` (NUMERIC(5, 2)) - RV as % of predicted
- `frc_liters` (NUMERIC(6, 3)) - Functional Residual Capacity
- `frc_percent_predicted` (NUMERIC(5, 2)) - FRC as % of predicted
- `vc_liters` (NUMERIC(6, 3)) - Vital Capacity
- `vc_percent_predicted` (NUMERIC(5, 2)) - VC as % of predicted

**Diffusion Capacity**:
- `dlco` (NUMERIC(6, 3)) - Diffusion capacity
- `dlco_percent_predicted` (NUMERIC(5, 2)) - DLCO as % of predicted

**Patient Demographics** (at time of test):
- `age_at_test` (INTEGER) - Patient age at test
- `height_cm` (NUMERIC(5, 2)) - Height in centimeters
- `weight_kg` (NUMERIC(5, 2)) - Weight in kilograms
- `gender` (TEXT) - Gender

**Quality Indicators**:
- `test_quality` (TEXT) - Quality: 'excellent', 'good', 'acceptable', 'poor'
- `bronchodilator_used` (BOOLEAN) - Whether bronchodilator was used
- `bronchodilator_type` (TEXT) - Type of bronchodilator

**Raw Data**:
- `raw_data` (JSONB) - Complete test data if needed

**Indexes**:
- Primary key on `id`
- Unique constraint on `pft_test_id`
- Index on `patient_id`

### pft_interpretations
Clinical interpretation of PFT results.

**Columns**:
- `id` (UUID, PK) - Primary key
- `pft_test_id` (UUID, FK) - References pft_tests
- `pft_result_id` (UUID, FK) - References pft_results
- `interpreted_by` (UUID, FK) - User who interpreted
- `interpretation_date` (TIMESTAMPTZ) - Interpretation date

**Interpretation Findings**:
- `overall_pattern` (TEXT) - Pattern: 'normal', 'obstructive', 'restrictive', 'mixed', 'airway_obstruction'
- `severity` (TEXT) - Severity: 'mild', 'moderate', 'moderate_severe', 'severe'
- `diagnosis` (TEXT) - Clinical diagnosis
- `recommendations` (TEXT) - Treatment recommendations
- `follow_up_required` (BOOLEAN) - Whether follow-up is required
- `follow_up_date` (DATE) - Follow-up date if required

**Additional**:
- `findings` (JSONB) - Structured findings
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Unique constraint on `(pft_test_id, pft_result_id)`
- Index on `pft_test_id`
- Index on `pft_result_id`

### referral_forms
Digital referral form management.

**Columns**:
- `id` (UUID, PK) - Primary key
- `referral_number` (TEXT, UNIQUE) - Auto-generated referral number
- `patient_id` (UUID, FK) - References patients

**Referring Information**:
- `referring_physician_name` (TEXT) - Referring physician name
- `referring_clinic_name` (TEXT) - Referring clinic name
- `referring_phone` (TEXT) - Referring phone
- `referring_fax` (TEXT) - Referring fax
- `referring_email` (TEXT) - Referring email
- `referring_address` (TEXT) - Referring address

**Referral Details**:
- `referral_type` (TEXT) - Type: 'sleep_study', 'cpap_titration', 'pft', 'respiratory_consult', 'dme'
- `reason_for_referral` (TEXT) - Reason for referral
- `clinical_history` (TEXT) - Clinical history
- `current_medications` (TEXT) - Current medications
- `insurance_provider` (TEXT) - Insurance provider
- `insurance_id` (TEXT) - Insurance ID

**Status and Processing**:
- `status` (TEXT) - Status: 'received', 'reviewed', 'scheduled', 'completed', 'cancelled'
- `received_date` (DATE) - Date received
- `reviewed_by` (UUID, FK) - User who reviewed
- `reviewed_date` (DATE) - Date reviewed
- `scheduled_date` (DATE) - Scheduled date

**Linked Entities**:
- `linked_sleep_study_id` (UUID, FK) - Linked sleep study
- `linked_pft_test_id` (UUID, FK) - Linked PFT test
- `linked_prescription_id` (UUID, FK) - Linked prescription

**Documents**:
- `referral_document_url` (TEXT) - Link to uploaded referral document
- `notes` (TEXT) - Additional notes
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Unique index on `referral_number`
- Index on `patient_id`
- Index on `status`
- Index on `referral_type`

## Relationships

```
user_profiles (1) ──< (many) patients
user_profiles (1) ──< (many) prescriptions (prescribed_by)
user_profiles (1) ──< (many) prescriptions (approved_by)
user_profiles (1) ──< (many) prescriptions (filled_by)
user_profiles (1) ──< (many) pft_tests (ordered_by)
user_profiles (1) ──< (many) pft_tests (performed_by)
user_profiles (1) ──< (many) pft_interpretations (interpreted_by)
user_profiles (1) ──< (many) referral_forms (reviewed_by)
patients (1) ──< (many) prescriptions
patients (1) ──< (many) communications
patients (1) ──< (many) pft_tests
patients (1) ──< (many) referral_forms
patients (1) ──|| (one) clinic_locations (preferred_location)
medications (1) ──< (many) prescriptions
clinic_locations (1) ──< (many) pft_tests
clinic_locations (1) ──< (many) sleep_studies
pft_tests (1) ──|| (one) pft_results
pft_tests (1) ──|| (one) pft_interpretations
pft_results (1) ──|| (one) pft_interpretations
prescriptions (1) ──< (many) communications
prescriptions (1) ──|| (one) referral_forms (linked_prescription)
sleep_studies (1) ──|| (one) referral_forms (linked_sleep_study)
pft_tests (1) ──|| (one) referral_forms (linked_pft_test)
ai_agents (1) ──< (many) ai_sessions
automations (1) ──< (many) automation_runs
```

## Functions

### match_documents

Vector similarity search function for RAG.

**Parameters**:

- `query_embedding` (vector(1536)) - Query embedding
- `match_threshold` (float) - Similarity threshold
- `match_count` (int) - Number of results

**Returns**: Table with matching documents and similarity scores

### update_updated_at_column

Trigger function to automatically update `updated_at` timestamp.

## Row Level Security (RLS)

All tables have RLS enabled. Policies should be configured based on:

- User roles
- Data ownership
- Business rules
- HIPAA compliance requirements

## Migrations

Migration files are in `supabase/migrations/`:

1. `001_initial_schema.sql` - Core schema
2. `002_ai_agents_data.sql` - Initial AI agent data
3. `003_comprehensive_rls_policies.sql` - RLS policies
4. `004_rag_functions.sql` - RAG functions
5. `005_legacy_parity_tables.sql` - Legacy compatibility
6. `006_encounters_and_followups.sql` - Clinical encounters
7. `007_sleep_clinic_dme.sql` - Sleep clinic DME features
8. `007_aeterna_runtime_v2.sql` - Aeterna OS runtime
9. `008_aeterna_agents_seed.sql` - Aeterna agent seed data
10. `009_pft_locations_referrals.sql` - PFT, locations, and referrals
5. `005_legacy_parity_tables.sql` - Legacy operational tables
6. `006_encounters_and_followups.sql` - Clinical monitoring tables
7. `007_aeterna_runtime_v2.sql` - Workflow Runtime and Equipment
8. `007_sleep_clinic_dme.sql` - CPAP/BiPAP DME and Sleep Studies
9. `008_aeterna_agents_seed.sql` - Aeterna core agent roster
10. `009_pft_locations_referrals.sql` - PFT, Multi-location, and Referral Forms

Apply migrations in order.
