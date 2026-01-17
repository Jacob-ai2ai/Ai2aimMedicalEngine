-- Comprehensive Row Level Security (RLS) Policies
-- This migration adds role-based access control for all tables

-- ============================================================================
-- PATIENTS TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to view patients
CREATE POLICY "Authenticated users can view patients"
  ON public.patients FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admin, physician, pharmacist, and nurse can create patients
CREATE POLICY "Authorized roles can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'physician', 'pharmacist', 'nurse', 'administrative')
    )
  );

-- Only admin, physician, and nurse can update patients
CREATE POLICY "Authorized roles can update patients"
  ON public.patients FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'physician', 'nurse', 'administrative')
    )
  );

-- Only admin can delete patients
CREATE POLICY "Only admin can delete patients"
  ON public.patients FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- MEDICATIONS TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to view medications
CREATE POLICY "Authenticated users can view medications"
  ON public.medications FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admin and pharmacist can create medications
CREATE POLICY "Authorized roles can create medications"
  ON public.medications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'pharmacist')
    )
  );

-- Only admin and pharmacist can update medications
CREATE POLICY "Authorized roles can update medications"
  ON public.medications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'pharmacist')
    )
  );

-- Only admin can delete medications
CREATE POLICY "Only admin can delete medications"
  ON public.medications FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- PRESCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Allow all authenticated users to view prescriptions
CREATE POLICY "Authenticated users can view prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only physician can create prescriptions
CREATE POLICY "Only physicians can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'physician')
    )
  );

-- Physicians, pharmacists, and admin can update prescriptions
CREATE POLICY "Authorized roles can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'physician', 'pharmacist')
    )
  );

-- Only admin can delete prescriptions
CREATE POLICY "Only admin can delete prescriptions"
  ON public.prescriptions FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- COMMUNICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view communications they're involved in or all if admin/nurse
CREATE POLICY "Users can view relevant communications"
  ON public.communications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role IN ('admin', 'nurse', 'physician', 'administrative')
    ) OR
    auth.uid() = from_user_id OR
    auth.uid() = to_user_id
  );

-- Authenticated users can create communications
CREATE POLICY "Authenticated users can create communications"
  ON public.communications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own communications or admins can update any
CREATE POLICY "Users can update own communications"
  ON public.communications FOR UPDATE
  USING (
    auth.uid() = from_user_id OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Users can delete their own communications or admins can delete any
CREATE POLICY "Users can delete own communications"
  ON public.communications FOR DELETE
  USING (
    auth.uid() = from_user_id OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- AI AGENTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view active AI agents
CREATE POLICY "Authenticated users can view active agents"
  ON public.ai_agents FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Only admin can create AI agents
CREATE POLICY "Only admin can create AI agents"
  ON public.ai_agents FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Only admin can update AI agents
CREATE POLICY "Only admin can update AI agents"
  ON public.ai_agents FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Only admin can delete AI agents
CREATE POLICY "Only admin can delete AI agents"
  ON public.ai_agents FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- AI SESSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own sessions or admin can view all
CREATE POLICY "Users can view own AI sessions"
  ON public.ai_sessions FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Authenticated users can create sessions
CREATE POLICY "Authenticated users can create AI sessions"
  ON public.ai_sessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own sessions
CREATE POLICY "Users can update own AI sessions"
  ON public.ai_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions or admin can delete any
CREATE POLICY "Users can delete own AI sessions"
  ON public.ai_sessions FOR DELETE
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- AUTOMATIONS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view active automations
CREATE POLICY "Authenticated users can view automations"
  ON public.automations FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admin and authorized roles can create automations
CREATE POLICY "Authorized roles can create automations"
  ON public.automations FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'physician', 'pharmacist', 'compliance')
    )
  );

-- Users can update their own automations or admin can update any
CREATE POLICY "Users can update own automations"
  ON public.automations FOR UPDATE
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Users can delete their own automations or admin can delete any
CREATE POLICY "Users can delete own automations"
  ON public.automations FOR DELETE
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- AUTOMATION RUNS TABLE POLICIES
-- ============================================================================

-- Users can view runs of their automations or admin can view all
CREATE POLICY "Users can view relevant automation runs"
  ON public.automation_runs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM public.automations WHERE id = automation_id
    ) OR
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- System can create automation runs (relaxed policy for automated processes)
CREATE POLICY "System can create automation runs"
  ON public.automation_runs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only system/admin can update automation runs
CREATE POLICY "Only admin can update automation runs"
  ON public.automation_runs FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Only admin can delete automation runs
CREATE POLICY "Only admin can delete automation runs"
  ON public.automation_runs FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- RAG DOCUMENTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can view RAG documents
CREATE POLICY "Authenticated users can view RAG documents"
  ON public.rag_documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admin and authorized roles can create documents
CREATE POLICY "Authorized roles can create RAG documents"
  ON public.rag_documents FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'physician', 'compliance')
    )
  );

-- Only admin can update RAG documents
CREATE POLICY "Only admin can update RAG documents"
  ON public.rag_documents FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- Only admin can delete RAG documents
CREATE POLICY "Only admin can delete RAG documents"
  ON public.rag_documents FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTION FOR ROLE CHECKING
-- ============================================================================

-- Create a function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDIT TRAIL
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'SELECT'
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admin and compliance can view audit logs
CREATE POLICY "Only admin and compliance can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE role IN ('admin', 'compliance')
    )
  );

-- System can create audit logs
CREATE POLICY "System can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Nobody can update or delete audit logs (immutable)
-- No UPDATE or DELETE policies = deny all

-- Create index for audit log queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ============================================================================
-- AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, old_data, new_data)
    VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, old_data)
    VALUES (auth.uid(), TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPLY AUDIT TRIGGERS TO SENSITIVE TABLES
-- ============================================================================

-- Patients audit trail
CREATE TRIGGER audit_patients
  AFTER INSERT OR UPDATE OR DELETE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Prescriptions audit trail
CREATE TRIGGER audit_prescriptions
  AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Communications audit trail
CREATE TRIGGER audit_communications
  AFTER INSERT OR UPDATE OR DELETE ON public.communications
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- User profiles audit trail
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Automations audit trail
CREATE TRIGGER audit_automations
  AFTER INSERT OR UPDATE OR DELETE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail for HIPAA compliance';
COMMENT ON FUNCTION public.has_role IS 'Helper function to check if current user has a specific role';
COMMENT ON FUNCTION public.has_any_role IS 'Helper function to check if current user has any of the specified roles';
COMMENT ON FUNCTION public.audit_trigger_function IS 'Trigger function to automatically log all changes to sensitive tables';
