/**
 * AI Agent Context Loader
 * Loads comprehensive context for AI agents to make informed recommendations
 */

import { createServerSupabase } from '@/lib/supabase/server'
import { RAGService } from './rag-service'

export interface PatientContext {
  id: string
  name: string
  age: number
  dateOfBirth: string
  allergies: string[]
  currentMedications: Array<{
    name: string
    dosage: string
    frequency: string
    startDate: string
  }>
  diagnoses: Array<{
    code: string
    description: string
    diagnosedDate: string
  }>
  recentEncounters: Array<{
    date: string
    type: string
    provider: string
    chiefComplaint: string
  }>
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    weight?: number
    height?: number
  }
}

export interface ClinicalContext {
  guidelines: string[]
  protocols: string[]
  recentStudies: string[]
  similarCases: any[]
}

export interface OperationalContext {
  currentAppointments: any[]
  staffCapacity: any[]
  pendingTasks: any[]
  recentActivity: any[]
}

export class AgentContextLoader {
  /**
   * Load complete patient context for AI agents
   */
  static async loadPatientContext(patientId: string): Promise<PatientContext | null> {
    const supabase = await createServerSupabase()

    // Load patient data
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (!patient) return null

    // Load current medications
    const { data: medications } = await supabase
      .from('prescriptions')
      .select('medications(*), dosage, frequency, prescribed_date')
      .eq('patient_id', patientId)
      .eq('status', 'filled')
      .gte('expires_at', new Date().toISOString())

    // Load recent encounters
    const { data: encounters } = await supabase
      .from('encounters')
      .select('*')
      .eq('patient_id', patientId)
      .order('encounter_date', { ascending: false })
      .limit(5)

    // Calculate age
    const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()

    return {
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      age,
      dateOfBirth: patient.date_of_birth,
      allergies: patient.allergies ? patient.allergies.split(',').map((a: string) => a.trim()) : [],
      currentMedications: (medications || []).map((med: any) => ({
        name: med.medications?.name || 'Unknown',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        startDate: med.prescribed_date || ''
      })),
      diagnoses: [], // Would load from encounters or diagnosis table
      recentEncounters: (encounters || []).map((enc: any) => ({
        date: enc.encounter_date,
        type: enc.encounter_type,
        provider: 'Provider Name', // Would join with user_profiles
        chiefComplaint: enc.chief_complaint || ''
      })),
      vitalSigns: {
        bloodPressure: patient.blood_pressure,
        heartRate: patient.heart_rate,
        weight: patient.weight,
        height: patient.height
      }
    }
  }

  /**
   * Load clinical guidelines and protocols using RAG
   */
  static async loadClinicalContext(query: string): Promise<ClinicalContext> {
    // Search for relevant clinical guidelines
    const guidelines = await RAGService.getRelevantContext(query, 1000)

    return {
      guidelines: guidelines ? [guidelines] : [],
      protocols: [],
      recentStudies: [],
      similarCases: []
    }
  }

  /**
   * Load operational context for scheduling and workflow optimization
   */
  static async loadOperationalContext(userId: string): Promise<OperationalContext> {
    const supabase = await createServerSupabase()

    // Load today's appointments for the user
    const today = new Date().toISOString().split('T')[0]
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', userId)
      .eq('appointment_date', today)
      .order('start_time')

    // Load staff capacity
    const { data: capacity } = await supabase
      .from('staff_capacity')
      .select('*')
      .eq('staff_id', userId)
      .eq('date', today)

    return {
      currentAppointments: appointments || [],
      staffCapacity: capacity || [],
      pendingTasks: [],
      recentActivity: []
    }
  }

  /**
   * Build complete context for an AI agent
   */
  static async buildAgentContext(options: {
    userId?: string
    userRole?: string
    patientId?: string
    task?: string
    query?: string
  }): Promise<{
    patient?: PatientContext
    clinical?: ClinicalContext
    operational?: OperationalContext
    systemContext: string
  }> {
    const context: any = {
      systemContext: `Current Date: ${new Date().toLocaleDateString()}\nCurrent Time: ${new Date().toLocaleTimeString()}`
    }

    // Load patient context if provided
    if (options.patientId) {
      context.patient = await this.loadPatientContext(options.patientId)
    }

    // Load clinical context if query provided
    if (options.query) {
      context.clinical = await this.loadClinicalContext(options.query)
    }

    // Load operational context if user provided
    if (options.userId) {
      context.operational = await this.loadOperationalContext(options.userId)
    }

    return context
  }
}
