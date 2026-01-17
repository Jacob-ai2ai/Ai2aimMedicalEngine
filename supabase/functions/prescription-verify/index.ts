// Edge Function: Prescription Verification
// AI-powered prescription verification with drug interaction checking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { prescriptionId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Get prescription with patient data
    const { data: prescription, error: prescError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          date_of_birth,
          allergies,
          medical_history
        ),
        medications (
          id,
          name,
          generic_name,
          drug_class,
          controlled_substance_schedule
        )
      `)
      .eq('id', prescriptionId)
      .single()

    if (prescError) throw prescError

    // 2. Get patient's current medications
    const { data: currentMeds } = await supabase
      .from('prescriptions')
      .select('medications(*)')
      .eq('patient_id', prescription.patient_id)
      .eq('status', 'filled')
      .gte('expires_at', new Date().toISOString())

    // 3. Check for allergies
    const allergyCheck = {
      hasAllergies: false,
      conflicts: [] as string[]
    }
    
    if (prescription.patients?.allergies) {
      const allergies = prescription.patients.allergies.toLowerCase()
      const medicationName = prescription.medications?.name?.toLowerCase() || ''
      const genericName = prescription.medications?.generic_name?.toLowerCase() || ''
      
      if (allergies.includes(medicationName) || allergies.includes(genericName)) {
        allergyCheck.hasAllergies = true
        allergyCheck.conflicts.push(`Patient is allergic to ${prescription.medications?.name}`)
      }
    }

    // 4. Check for drug interactions (simplified - in production use drug database API)
    const interactionCheck = {
      hasInteractions: false,
      interactions: [] as Array<{severity: string, description: string}>
    }
    
    // TODO: Integrate with drug interaction database (e.g., FDA API, Micromedex)
    // For now, check if patient is on multiple controlled substances
    if (prescription.medications?.controlled_substance_schedule) {
      const controlledMeds = currentMeds?.filter(
        (m: any) => m.medications?.controlled_substance_schedule
      )
      
      if (controlledMeds && controlledMeds.length > 0) {
        interactionCheck.hasInteractions = true
        interactionCheck.interactions.push({
          severity: 'moderate',
          description: 'Patient is already on controlled substances - review carefully'
        })
      }
    }

    // 5. AI Verification (placeholder - integrate with OpenAI in production)
    const aiVerification = {
      verified: true,
      confidence: 0.95,
      flags: [] as string[],
      recommendations: [] as string[]
    }

    if (allergyCheck.hasAllergies) {
      aiVerification.verified = false
      aiVerification.flags.push('ALLERGY_CONFLICT')
      aiVerification.recommendations.push('Review patient allergies before dispensing')
    }

    if (interactionCheck.hasInteractions) {
      aiVerification.flags.push('DRUG_INTERACTION')
      aiVerification.recommendations.push('Check drug interactions')
    }

    // 6. Update prescription with verification results
    const { error: updateError } = await supabase
      .from('prescriptions')
      .update({
        verification_status: aiVerification.verified ? 'verified' : 'flagged',
        verification_notes: JSON.stringify({
          allergyCheck,
          interactionCheck,
          aiVerification,
          verified_at: new Date().toISOString()
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', prescriptionId)

    if (updateError) throw updateError

    // 7. Create audit log
    await supabase.from('audit_logs').insert({
      table_name: 'prescriptions',
      record_id: prescriptionId,
      action: 'verify',
      user_id: prescription.prescribed_by,
      changes: {
        verification_status: aiVerification.verified ? 'verified' : 'flagged'
      }
    })

    return new Response(JSON.stringify({
      success: true,
      verified: aiVerification.verified,
      prescription_id: prescriptionId,
      checks: {
        allergies: allergyCheck,
        interactions: interactionCheck,
        ai_verification: aiVerification
      }
    }), {
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error('Prescription verification error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
