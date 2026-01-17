export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole =
  | "admin"
  | "physician"
  | "pharmacist"
  | "nurse"
  | "billing"
  | "compliance"
  | "administrative"

export type PrescriptionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "filled"
  | "dispensed"
  | "cancelled"

export type CommunicationType = "letter" | "referral" | "message" | "notification"

export type CommunicationDirection = "inbound" | "outbound"

// Export type aliases for convenience
export type Patient = Database["public"]["Tables"]["patients"]["Row"]
export type Prescription = Database["public"]["Tables"]["prescriptions"]["Row"]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          patient_id: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: string | null
          phone: string | null
          email: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          insurance_provider: string | null
          insurance_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: Json | null
          allergies: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
          primary_sleep_diagnosis: string | null
          ahi_score: number | null
          cpap_titration_date: string | null
          preferred_location_id: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: string | null
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          insurance_provider?: string | null
          insurance_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Json | null
          allergies?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          primary_sleep_diagnosis?: string | null
          ahi_score?: number | null
          cpap_titration_date?: string | null
          preferred_location_id?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: string | null
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          insurance_provider?: string | null
          insurance_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: Json | null
          allergies?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          primary_sleep_diagnosis?: string | null
          ahi_score?: number | null
          cpap_titration_date?: string | null
        }
      }
      prescriptions: {
        Row: {
          id: string
          prescription_number: string
          patient_id: string
          medication_id: string
          dosage: string
          quantity: number
          refills: number
          instructions: string | null
          status: PrescriptionStatus
          prescribed_by: string | null
          approved_by: string | null
          filled_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
          filled_at: string | null
          expires_at: string | null
          is_dme: boolean | null
          dme_category: string | null
        }
        Insert: {
          id?: string
          prescription_number: string
          patient_id: string
          medication_id: string
          dosage: string
          quantity: number
          refills?: number
          instructions?: string | null
          status?: PrescriptionStatus
          prescribed_by?: string | null
          approved_by?: string | null
          filled_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          filled_at?: string | null
          expires_at?: string | null
          is_dme?: boolean | null
          dme_category?: string | null
        }
        Update: {
          id?: string
          prescription_number?: string
          patient_id?: string
          medication_id?: string
          dosage?: string
          quantity?: number
          refills?: number
          instructions?: string | null
          status?: PrescriptionStatus
          prescribed_by?: string | null
          approved_by?: string | null
          filled_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          filled_at?: string | null
          expires_at?: string | null
          is_dme?: boolean | null
          dme_category?: string | null
        }
      }
      ai_agents: {
        Row: {
          id: string
          name: string
          role: UserRole
          agent_type: string
          description: string | null
          system_prompt: string | null
          capabilities: Json | null
          is_active: boolean
          config: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: UserRole
          agent_type: string
          description?: string | null
          system_prompt?: string | null
          capabilities?: Json | null
          is_active?: boolean
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: UserRole
          agent_type?: string
          description?: string | null
          system_prompt?: string | null
          capabilities?: Json | null
          is_active?: boolean
          config?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      encounters: {
        Row: {
          id: string
          patient_id: string
          encounter_date: string
          encounter_type: string | null
          provider_id: string | null
          specialist_id: string | null
          diagnosis: string | null
          notes: string | null
          billing_status: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          encounter_date: string
          encounter_type?: string | null
          provider_id?: string | null
          specialist_id?: string | null
          diagnosis?: string | null
          notes?: string | null
          billing_status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          encounter_date?: string
          encounter_type?: string | null
          provider_id?: string | null
          specialist_id?: string | null
          diagnosis?: string | null
          notes?: string | null
          billing_status?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      follow_ups: {
        Row: {
          id: string
          patient_id: string
          encounter_id: string | null
          follow_up_type: string
          due_date: string
          status: string
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          encounter_id?: string | null
          follow_up_type: string
          due_date: string
          status?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          encounter_id?: string | null
          follow_up_type?: string
          due_date?: string
          status?: string
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      dme_equipment: {
        Row: {
          id: string
          equipment_code: string
          name: string
          category: string
          manufacturer: string | null
          model: string | null
          description: string | null
          unit_cost: number | null
          rental_rate_monthly: number | null
          requires_prescription: boolean
          insurance_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_code: string
          name: string
          category: string
          manufacturer?: string | null
          model?: string | null
          description?: string | null
          unit_cost?: number | null
          rental_rate_monthly?: number | null
          requires_prescription?: boolean
          insurance_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_code?: string
          name?: string
          category?: string
          manufacturer?: string | null
          model?: string | null
          description?: string | null
          unit_cost?: number | null
          rental_rate_monthly?: number | null
          requires_prescription?: boolean
          insurance_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dme_inventory: {
        Row: {
          id: string
          equipment_id: string
          serial_number: string | null
          status: string
          assigned_to_patient_id: string | null
          assigned_at: string | null
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          purchase_date: string | null
          warranty_expires: string | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          serial_number?: string | null
          status?: string
          assigned_to_patient_id?: string | null
          assigned_at?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          purchase_date?: string | null
          warranty_expires?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          serial_number?: string | null
          status?: string
          assigned_to_patient_id?: string | null
          assigned_at?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          purchase_date?: string | null
          warranty_expires?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dme_prescriptions: {
        Row: {
          id: string
          prescription_id: string
          equipment_id: string
          rental_or_purchase: string
          duration_months: number | null
          insurance_authorization_number: string | null
          authorization_expires: string | null
          delivery_address: string | null
          delivery_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prescription_id: string
          equipment_id: string
          rental_or_purchase?: string
          duration_months?: number | null
          insurance_authorization_number?: string | null
          authorization_expires?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prescription_id?: string
          equipment_id?: string
          rental_or_purchase?: string
          duration_months?: number | null
          insurance_authorization_number?: string | null
          authorization_expires?: string | null
          delivery_address?: string | null
          delivery_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cpap_compliance: {
        Row: {
          id: string
          patient_id: string
          dme_prescription_id: string | null
          equipment_serial_number: string | null
          compliance_period_start: string
          compliance_period_end: string
          days_used: number
          days_required: number
          average_hours_per_night: number | null
          compliance_percentage: number | null
          meets_insurance_requirements: boolean
          data_source: string | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          dme_prescription_id?: string | null
          equipment_serial_number?: string | null
          compliance_period_start: string
          compliance_period_end: string
          days_used?: number
          days_required?: number
          average_hours_per_night?: number | null
          compliance_percentage?: number | null
          meets_insurance_requirements?: boolean
          data_source?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          dme_prescription_id?: string | null
          equipment_serial_number?: string | null
          compliance_period_start?: string
          compliance_period_end?: string
          days_used?: number
          days_required?: number
          average_hours_per_night?: number | null
          compliance_percentage?: number | null
          meets_insurance_requirements?: boolean
          data_source?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      sleep_studies: {
        Row: {
          id: string
          patient_id: string
          study_type: string
          study_date: string | null
          ordered_by: string | null
          monitor_serial_number: string | null
          status: string
          dispatch_date: string | null
          return_date: string | null
          interpretation_date: string | null
          interpreted_by: string | null
          results: Json | null
          diagnosis: string | null
          recommendations: string | null
          location_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          study_type: string
          study_date?: string | null
          ordered_by?: string | null
          monitor_serial_number?: string | null
          status?: string
          dispatch_date?: string | null
          return_date?: string | null
          interpretation_date?: string | null
          interpreted_by?: string | null
          results?: Json | null
          diagnosis?: string | null
          recommendations?: string | null
          location_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          study_type?: string
          study_date?: string | null
          ordered_by?: string | null
          monitor_serial_number?: string | null
          status?: string
          dispatch_date?: string | null
          return_date?: string | null
          interpretation_date?: string | null
          interpreted_by?: string | null
          results?: Json | null
          diagnosis?: string | null
          recommendations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clinic_locations: {
        Row: {
          id: string
          location_code: string
          name: string
          address_line1: string
          address_line2: string | null
          city: string
          province: string
          postal_code: string
          phone: string | null
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          location_code: string
          name: string
          address_line1: string
          address_line2?: string | null
          city: string
          province?: string
          postal_code: string
          phone?: string | null
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          location_code?: string
          name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          province?: string
          postal_code?: string
          phone?: string | null
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pft_tests: {
        Row: {
          id: string
          patient_id: string
          test_type: string
          test_date: string
          ordered_by: string | null
          performed_by: string | null
          location_id: string | null
          indication: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          test_type: string
          test_date: string
          ordered_by?: string | null
          performed_by?: string | null
          location_id?: string | null
          indication?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          test_type?: string
          test_date?: string
          ordered_by?: string | null
          performed_by?: string | null
          location_id?: string | null
          indication?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pft_results: {
        Row: {
          id: string
          pft_test_id: string
          patient_id: string
          fev1_liters: number | null
          fev1_percent_predicted: number | null
          fvc_liters: number | null
          fvc_percent_predicted: number | null
          fev1_fvc_ratio: number | null
          pef_liters_per_sec: number | null
          tlc_liters: number | null
          tlc_percent_predicted: number | null
          rv_liters: number | null
          rv_percent_predicted: number | null
          frc_liters: number | null
          frc_percent_predicted: number | null
          vc_liters: number | null
          vc_percent_predicted: number | null
          dlco: number | null
          dlco_percent_predicted: number | null
          age_at_test: number | null
          height_cm: number | null
          weight_kg: number | null
          gender: string | null
          test_quality: string | null
          bronchodilator_used: boolean | null
          bronchodilator_type: string | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pft_test_id: string
          patient_id: string
          fev1_liters?: number | null
          fev1_percent_predicted?: number | null
          fvc_liters?: number | null
          fvc_percent_predicted?: number | null
          fev1_fvc_ratio?: number | null
          pef_liters_per_sec?: number | null
          tlc_liters?: number | null
          tlc_percent_predicted?: number | null
          rv_liters?: number | null
          rv_percent_predicted?: number | null
          frc_liters?: number | null
          frc_percent_predicted?: number | null
          vc_liters?: number | null
          vc_percent_predicted?: number | null
          dlco?: number | null
          dlco_percent_predicted?: number | null
          age_at_test?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          gender?: string | null
          test_quality?: string | null
          bronchodilator_used?: boolean | null
          bronchodilator_type?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pft_test_id?: string
          patient_id?: string
          fev1_liters?: number | null
          fev1_percent_predicted?: number | null
          fvc_liters?: number | null
          fvc_percent_predicted?: number | null
          fev1_fvc_ratio?: number | null
          pef_liters_per_sec?: number | null
          tlc_liters?: number | null
          tlc_percent_predicted?: number | null
          rv_liters?: number | null
          rv_percent_predicted?: number | null
          frc_liters?: number | null
          frc_percent_predicted?: number | null
          vc_liters?: number | null
          vc_percent_predicted?: number | null
          dlco?: number | null
          dlco_percent_predicted?: number | null
          age_at_test?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          gender?: string | null
          test_quality?: string | null
          bronchodilator_used?: boolean | null
          bronchodilator_type?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      pft_interpretations: {
        Row: {
          id: string
          pft_test_id: string
          pft_result_id: string
          interpreted_by: string
          interpretation_date: string
          overall_pattern: string | null
          severity: string | null
          diagnosis: string | null
          recommendations: string | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          findings: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pft_test_id: string
          pft_result_id: string
          interpreted_by: string
          interpretation_date?: string
          overall_pattern?: string | null
          severity?: string | null
          diagnosis?: string | null
          recommendations?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          findings?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pft_test_id?: string
          pft_result_id?: string
          interpreted_by?: string
          interpretation_date?: string
          overall_pattern?: string | null
          severity?: string | null
          diagnosis?: string | null
          recommendations?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          findings?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      referral_forms: {
        Row: {
          id: string
          referral_number: string
          patient_id: string | null
          referring_physician_name: string | null
          referring_clinic_name: string | null
          referring_phone: string | null
          referring_fax: string | null
          referring_email: string | null
          referring_address: string | null
          referral_type: string
          reason_for_referral: string
          clinical_history: string | null
          current_medications: string | null
          insurance_provider: string | null
          insurance_id: string | null
          status: string
          received_date: string
          reviewed_by: string | null
          reviewed_date: string | null
          scheduled_date: string | null
          linked_sleep_study_id: string | null
          linked_pft_test_id: string | null
          linked_prescription_id: string | null
          referral_document_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referral_number?: string
          patient_id?: string | null
          referring_physician_name?: string | null
          referring_clinic_name?: string | null
          referring_phone?: string | null
          referring_fax?: string | null
          referring_email?: string | null
          referring_address?: string | null
          referral_type: string
          reason_for_referral: string
          clinical_history?: string | null
          current_medications?: string | null
          insurance_provider?: string | null
          insurance_id?: string | null
          status?: string
          received_date?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          scheduled_date?: string | null
          linked_sleep_study_id?: string | null
          linked_pft_test_id?: string | null
          linked_prescription_id?: string | null
          referral_document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          referral_number?: string
          patient_id?: string | null
          referring_physician_name?: string | null
          referring_clinic_name?: string | null
          referring_phone?: string | null
          referring_fax?: string | null
          referring_email?: string | null
          referring_address?: string | null
          referral_type?: string
          reason_for_referral?: string
          clinical_history?: string | null
          current_medications?: string | null
          insurance_provider?: string | null
          insurance_id?: string | null
          status?: string
          received_date?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          scheduled_date?: string | null
          linked_sleep_study_id?: string | null
          linked_pft_test_id?: string | null
          linked_prescription_id?: string | null
          referral_document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      prescription_status: PrescriptionStatus
      communication_type: CommunicationType
      communication_direction: CommunicationDirection
    }
  }
}
