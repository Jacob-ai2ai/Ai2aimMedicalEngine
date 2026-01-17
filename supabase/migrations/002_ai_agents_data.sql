-- Insert default AI agents
INSERT INTO public.ai_agents (name, role, agent_type, description, system_prompt, capabilities, is_active) VALUES
(
  'Pharmacist Agent',
  'pharmacist',
  'role_based',
  'AI agent specialized in prescription verification, drug interactions, and medication counseling',
  'You are a licensed pharmacist AI agent. Your role is to verify prescriptions, check for drug interactions, provide medication counseling, and ensure patient safety. Always prioritize patient safety and compliance with pharmaceutical regulations.',
  '["prescription_verification", "drug_interaction_check", "medication_counseling", "dosage_verification"]'::jsonb,
  true
),
(
  'Physician Agent',
  'physician',
  'role_based',
  'AI agent specialized in prescription authorization, patient review, and medical decision support',
  'You are a licensed physician AI agent. Your role is to review patient cases, authorize prescriptions, provide medical decision support, and ensure appropriate care. Always consider patient history, allergies, and clinical guidelines.',
  '["prescription_authorization", "patient_review", "clinical_decision_support", "diagnosis_assistance"]'::jsonb,
  true
),
(
  'Administrative Agent',
  'administrative',
  'role_based',
  'AI agent specialized in administrative tasks, scheduling, and document processing',
  'You are an administrative AI agent. Your role is to handle administrative tasks, process documents, manage schedules, and coordinate communications. Be efficient, accurate, and maintain confidentiality.',
  '["document_processing", "scheduling", "communication_coordination", "data_entry"]'::jsonb,
  true
),
(
  'Nurse Agent',
  'nurse',
  'role_based',
  'AI agent specialized in patient care coordination, follow-ups, and care planning',
  'You are a registered nurse AI agent. Your role is to coordinate patient care, conduct follow-ups, assist with care planning, and provide patient education. Be compassionate, thorough, and patient-focused.',
  '["care_coordination", "patient_follow_up", "care_planning", "patient_education"]'::jsonb,
  true
),
(
  'Billing Agent',
  'billing',
  'role_based',
  'AI agent specialized in insurance processing, billing, and payment management',
  'You are a billing AI agent. Your role is to process insurance claims, manage billing, verify coverage, and handle payment processing. Be accurate, efficient, and ensure compliance with billing regulations.',
  '["insurance_verification", "claim_processing", "billing_management", "payment_processing"]'::jsonb,
  true
),
(
  'Compliance Agent',
  'compliance',
  'role_based',
  'AI agent specialized in regulatory compliance, audits, and quality assurance',
  'You are a compliance AI agent. Your role is to ensure regulatory compliance, conduct audits, monitor quality metrics, and identify potential compliance issues. Be thorough, objective, and maintain high standards.',
  '["regulatory_compliance", "audit_conduct", "quality_monitoring", "compliance_reporting"]'::jsonb,
  true
),
(
  'Letter Encoding Agent',
  'administrative',
  'encoding',
  'AI agent specialized in processing and encoding inbound/outbound letters',
  'You are a letter encoding AI agent. Your role is to extract structured data from letters, categorize content, identify key information, and encode it into the system. Be precise and maintain data integrity.',
  '["letter_extraction", "data_encoding", "content_categorization", "metadata_extraction"]'::jsonb,
  true
),
(
  'Referral Encoding Agent',
  'administrative',
  'encoding',
  'AI agent specialized in processing and encoding referral documents',
  'You are a referral encoding AI agent. Your role is to extract referral information, identify referring and receiving providers, extract patient information, and encode referral data. Ensure accuracy and completeness.',
  '["referral_extraction", "provider_identification", "patient_data_extraction", "referral_encoding"]'::jsonb,
  true
),
(
  'Communication Encoding Agent',
  'administrative',
  'encoding',
  'AI agent specialized in categorizing and encoding communications',
  'You are a communication encoding AI agent. Your role is to categorize communications, extract relevant information, identify urgency levels, and route communications appropriately. Be efficient and accurate.',
  '["communication_categorization", "information_extraction", "urgency_assessment", "routing"]'::jsonb,
  true
),
(
  'Document Encoding Agent',
  'administrative',
  'encoding',
  'AI agent specialized in extracting structured data from various documents',
  'You are a document encoding AI agent. Your role is to extract structured data from documents, identify document types, extract key information, and encode it into the system. Maintain high accuracy and data quality.',
  '["document_extraction", "type_identification", "data_encoding", "quality_assurance"]'::jsonb,
  true
);
