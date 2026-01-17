import { createServerSupabase } from "@/lib/supabase/server"

export interface ClinicLocation {
  id: string
  location_code: string
  name: string
  address_line1: string
  address_line2?: string
  city: string
  province: string
  postal_code: string
  phone?: string
  email?: string
  is_active: boolean
}

export interface PFTTest {
  id: string
  patient_id: string
  test_type: "spirometry" | "lung_volume" | "diffusion_capacity" | "full_pft"
  test_date: string
  ordered_by?: string
  performed_by?: string
  location_id?: string
  indication?: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  notes?: string
  location?: ClinicLocation
}

export interface PFTResult {
  id: string
  pft_test_id: string
  patient_id: string
  
  // Spirometry
  fev1_liters?: number
  fev1_percent_predicted?: number
  fvc_liters?: number
  fvc_percent_predicted?: number
  fev1_fvc_ratio?: number
  pef_liters_per_sec?: number
  
  // Lung Volume
  tlc_liters?: number
  tlc_percent_predicted?: number
  rv_liters?: number
  rv_percent_predicted?: number
  frc_liters?: number
  frc_percent_predicted?: number
  vc_liters?: number
  vc_percent_predicted?: number
  
  // Diffusion Capacity
  dlco?: number
  dlco_percent_predicted?: number
  
  // Patient demographics at test time
  age_at_test?: number
  height_cm?: number
  weight_kg?: number
  gender?: string
  
  // Quality
  test_quality?: "excellent" | "good" | "acceptable" | "poor"
  bronchodilator_used?: boolean
  bronchodilator_type?: string
  
  raw_data?: any
}

export interface PFTInterpretation {
  id: string
  pft_test_id: string
  pft_result_id: string
  interpreted_by: string
  interpretation_date: string
  overall_pattern?: "normal" | "obstructive" | "restrictive" | "mixed" | "airway_obstruction"
  severity?: "mild" | "moderate" | "moderate_severe" | "severe"
  diagnosis?: string
  recommendations?: string
  follow_up_required?: boolean
  follow_up_date?: string
  findings?: any
  notes?: string
}

export interface CreatePFTTestInput {
  patient_id: string
  test_type: "spirometry" | "lung_volume" | "diffusion_capacity" | "full_pft"
  test_date: string
  ordered_by?: string
  location_id?: string
  indication?: string
  notes?: string
}

export interface CreatePFTResultInput {
  pft_test_id: string
  patient_id: string
  fev1_liters?: number
  fev1_percent_predicted?: number
  fvc_liters?: number
  fvc_percent_predicted?: number
  fev1_fvc_ratio?: number
  pef_liters_per_sec?: number
  tlc_liters?: number
  tlc_percent_predicted?: number
  rv_liters?: number
  rv_percent_predicted?: number
  frc_liters?: number
  frc_percent_predicted?: number
  vc_liters?: number
  vc_percent_predicted?: number
  dlco?: number
  dlco_percent_predicted?: number
  age_at_test?: number
  height_cm?: number
  weight_kg?: number
  gender?: string
  test_quality?: "excellent" | "good" | "acceptable" | "poor"
  bronchodilator_used?: boolean
  bronchodilator_type?: string
  raw_data?: any
}

export interface CreatePFTInterpretationInput {
  pft_test_id: string
  pft_result_id: string
  interpreted_by: string
  overall_pattern?: "normal" | "obstructive" | "restrictive" | "mixed" | "airway_obstruction"
  severity?: "mild" | "moderate" | "moderate_severe" | "severe"
  diagnosis?: string
  recommendations?: string
  follow_up_required?: boolean
  follow_up_date?: string
  findings?: any
  notes?: string
}

export class PFTService {
  /**
   * Get all clinic locations
   */
  async getLocations(activeOnly: boolean = true): Promise<ClinicLocation[]> {
    const supabase = await createServerSupabase()
    let query = supabase.from("clinic_locations").select("*")
    
    if (activeOnly) {
      query = query.eq("is_active", true)
    }
    
    const { data, error } = await query.order("location_code")
    
    if (error) {
      console.error("Error fetching locations:", error)
      throw new Error("Failed to fetch clinic locations")
    }
    
    return data || []
  }

  /**
   * Get a specific location
   */
  async getLocation(locationId: string): Promise<ClinicLocation | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("clinic_locations")
      .select("*")
      .eq("id", locationId)
      .single()
    
    if (error) {
      console.error("Error fetching location:", error)
      return null
    }
    
    return data
  }

  /**
   * Create a new PFT test
   */
  async createPFTTest(input: CreatePFTTestInput): Promise<PFTTest> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_tests")
      .insert({
        patient_id: input.patient_id,
        test_type: input.test_type,
        test_date: input.test_date,
        ordered_by: input.ordered_by,
        location_id: input.location_id,
        indication: input.indication,
        notes: input.notes,
        status: "scheduled",
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error creating PFT test:", error)
      throw new Error("Failed to create PFT test")
    }
    
    const test = await this.getPFTTest(data.id)
    if (!test) {
      throw new Error("Failed to retrieve created PFT test")
    }
    return test
  }

  /**
   * Get a PFT test by ID
   */
  async getPFTTest(testId: string): Promise<PFTTest | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_tests")
      .select(`
        *,
        location:clinic_locations(*)
      `)
      .eq("id", testId)
      .single()
    
    if (error) {
      console.error("Error fetching PFT test:", error)
      return null
    }
    
    return data
  }

  /**
   * Get all PFT tests for a patient
   */
  async getPatientPFTTests(patientId: string): Promise<PFTTest[]> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_tests")
      .select(`
        *,
        location:clinic_locations(*)
      `)
      .eq("patient_id", patientId)
      .order("test_date", { ascending: false })
    
    if (error) {
      console.error("Error fetching patient PFT tests:", error)
      return []
    }
    
    return data || []
  }

  /**
   * Update PFT test status
   */
  async updatePFTTestStatus(
    testId: string,
    status: "scheduled" | "in_progress" | "completed" | "cancelled",
    performedBy?: string
  ): Promise<boolean> {
    const supabase = await createServerSupabase()
    const updateData: any = { status }
    
    if (performedBy) {
      updateData.performed_by = performedBy
    }
    
    const { error } = await supabase
      .from("pft_tests")
      .update(updateData)
      .eq("id", testId)
    
    if (error) {
      console.error("Error updating PFT test status:", error)
      return false
    }
    
    return true
  }

  /**
   * Create PFT results
   */
  async createPFTResult(input: CreatePFTResultInput): Promise<PFTResult> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_results")
      .insert(input)
      .select()
      .single()
    
    if (error) {
      console.error("Error creating PFT result:", error)
      throw new Error("Failed to create PFT result")
    }
    
    // Update test status to completed if results are entered
    await this.updatePFTTestStatus(data.pft_test_id, "completed")
    
    return data
  }

  /**
   * Get PFT results for a test
   */
  async getPFTResult(testId: string): Promise<PFTResult | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_results")
      .select("*")
      .eq("pft_test_id", testId)
      .single()
    
    if (error) {
      console.error("Error fetching PFT result:", error)
      return null
    }
    
    return data
  }

  /**
   * Create PFT interpretation
   */
  async createPFTInterpretation(
    input: CreatePFTInterpretationInput
  ): Promise<PFTInterpretation> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_interpretations")
      .insert({
        ...input,
        interpretation_date: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error creating PFT interpretation:", error)
      throw new Error("Failed to create PFT interpretation")
    }
    
    return data
  }

  /**
   * Get PFT interpretation for a test
   */
  async getPFTInterpretation(testId: string): Promise<PFTInterpretation | null> {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from("pft_interpretations")
      .select("*")
      .eq("pft_test_id", testId)
      .single()
    
    if (error) {
      console.error("Error fetching PFT interpretation:", error)
      return null
    }
    
    return data
  }

  /**
   * Get complete PFT test with results and interpretation
   */
  async getCompletePFTTest(testId: string): Promise<{
    test: PFTTest | null
    result: PFTResult | null
    interpretation: PFTInterpretation | null
  }> {
    const test = await this.getPFTTest(testId)
    if (!test) {
      return { test: null, result: null, interpretation: null }
    }
    
    const result = await this.getPFTResult(testId)
    const interpretation = await this.getPFTInterpretation(testId)
    
    return { test, result, interpretation }
  }

  /**
   * Calculate predicted values (simplified - in production, use proper reference equations)
   */
  calculatePredictedValues(
    age: number,
    height: number,
    gender: "male" | "female"
  ): {
    fev1_predicted: number
    fvc_predicted: number
    tlc_predicted: number
  } {
    // Simplified calculations - in production, use proper reference equations
    // (e.g., GLI-2012, NHANES III, etc.)
    const heightM = height / 100
    
    if (gender === "male") {
      return {
        fev1_predicted: (0.0414 * heightM - 0.0244 * age - 2.19) * 1000,
        fvc_predicted: (0.0553 * heightM - 0.0265 * age - 1.58) * 1000,
        tlc_predicted: (0.094 * heightM - 0.015 * age - 1.8) * 1000,
      }
    } else {
      return {
        fev1_predicted: (0.0342 * heightM - 0.0255 * age - 1.578) * 1000,
        fvc_predicted: (0.0443 * heightM - 0.026 * age - 1.26) * 1000,
        tlc_predicted: (0.079 * heightM - 0.008 * age - 1.34) * 1000,
      }
    }
  }

  /**
   * Interpret PFT results (automated interpretation helper)
   */
  interpretResults(result: PFTResult): {
    pattern: "normal" | "obstructive" | "restrictive" | "mixed" | "airway_obstruction"
    severity: "mild" | "moderate" | "moderate_severe" | "severe"
    diagnosis?: string
  } {
    if (!result.fev1_percent_predicted || !result.fvc_percent_predicted || !result.fev1_fvc_ratio) {
      return { pattern: "airway_obstruction", severity: "mild" }
    }
    
    const fev1Percent = result.fev1_percent_predicted
    const fvcPercent = result.fvc_percent_predicted
    const ratio = result.fev1_fvc_ratio
    
    // Determine pattern
    let pattern: "normal" | "obstructive" | "restrictive" | "mixed" | "airway_obstruction"
    const isObstructive = ratio < 0.70 && fvcPercent >= 80
    const isRestrictive = ratio >= 0.70 && fvcPercent < 80
    
    if (isObstructive && isRestrictive) {
      pattern = "mixed"
    } else if (isObstructive) {
      pattern = "obstructive"
    } else if (isRestrictive) {
      pattern = "restrictive"
    } else if (ratio < 0.70) {
      pattern = "airway_obstruction"
    } else {
      pattern = "normal"
    }
    
    // Determine severity (based on FEV1 % predicted for obstructive, FVC for restrictive)
    let severity: "mild" | "moderate" | "moderate_severe" | "severe"
    const percent = pattern === "restrictive" ? fvcPercent : fev1Percent
    
    if (percent >= 80) {
      severity = "mild"
    } else if (percent >= 60) {
      severity = "moderate"
    } else if (percent >= 50) {
      severity = "moderate_severe"
    } else {
      severity = "severe"
    }
    
    // Suggest diagnosis
    let diagnosis: string | undefined
    if (pattern === "obstructive") {
      if (severity === "mild" || severity === "moderate") {
        diagnosis = "Asthma (likely)"
      } else {
        diagnosis = "COPD (likely)"
      }
    } else if (pattern === "restrictive") {
      diagnosis = "Restrictive lung disease"
    }
    
    return { pattern, severity, diagnosis }
  }

  /**
   * Get scheduled PFT tests
   */
  async getScheduledTests(locationId?: string): Promise<PFTTest[]> {
    const supabase = await createServerSupabase()
    let query = supabase
      .from("pft_tests")
      .select(`
        *,
        location:clinic_locations(*)
      `)
      .eq("status", "scheduled")
      .order("test_date", { ascending: true })
    
    if (locationId) {
      query = query.eq("location_id", locationId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error("Error fetching scheduled tests:", error)
      return []
    }
    
    return data || []
  }
}

export const pftService = new PFTService()
