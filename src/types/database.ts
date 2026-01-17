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
