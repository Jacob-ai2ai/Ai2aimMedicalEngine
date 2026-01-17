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
UPDATE ON public.medical_equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();