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

### rag_documents
RAG document store with vector embeddings.

**Columns**:
- `id` (UUID, PK) - Primary key
- `title` (TEXT) - Document title
- `content` (TEXT) - Document content
- `document_type` (TEXT) - Document type
- `source` (TEXT) - Source identifier
- `embedding` (vector(1536)) - Vector embedding
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

**Indexes**:
- Primary key on `id`
- Vector index on `embedding` (IVFFlat)

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

## Relationships

```
user_profiles (1) ──< (many) patients
user_profiles (1) ──< (many) prescriptions (prescribed_by)
user_profiles (1) ──< (many) prescriptions (approved_by)
user_profiles (1) ──< (many) prescriptions (filled_by)
patients (1) ──< (many) prescriptions
medications (1) ──< (many) prescriptions
patients (1) ──< (many) communications
user_profiles (1) ──< (many) communications (from_user_id)
user_profiles (1) ──< (many) communications (to_user_id)
prescriptions (1) ──< (many) communications
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
3. `004_rag_functions.sql` - RAG functions

Apply migrations in order.
