/**
 * Physician AI Agent
 * Assists physicians with clinical decisions, diagnosis, and treatment planning
 */

import { BaseAgent } from '../base-agent'
import { AgentMessage, AgentContext } from '@/types/ai'
import { AgentContextLoader } from '../context-loader'

export class PhysicianAgent extends BaseAgent {
  constructor() {
    super(
      'physician-agent',
      'Physician AI Assistant',
      'physician',
      'role_based',
      'AI assistant for clinical decision support, diagnosis suggestions, and treatment planning',
      [
        { name: 'Clinical Decision Support', description: 'Provide evidence-based clinical recommendations', enabled: true },
        { name: 'Diagnosis Assistance', description: 'Suggest potential diagnoses based on symptoms and test results', enabled: true },
        { name: 'Treatment Planning', description: 'Recommend appropriate treatment protocols', enabled: true },
        { name: 'Prescription Review', description: 'Review prescriptions for appropriateness and safety', enabled: true },
        { name: 'Sleep Study Interpretation', description: 'Assist with HSAT and PSG interpretation', enabled: true }
      ],
      {
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        maxTokens: 1500,
        systemPrompt: PhysicianAgent.SYSTEM_PROMPT
      }
    )
  }

  private static SYSTEM_PROMPT = `You are a licensed physician AI assistant specializing in sleep medicine and respiratory disorders.

CLINIC CONTEXT:
- Specialty: Sleep disorders, sleep apnea, CPAP therapy, pulmonary function
- Services: Home sleep studies (HSAT), in-lab PSG, PFT testing, CPAP titration
- Common conditions: Obstructive sleep apnea (OSA), central sleep apnea, COPD, asthma

YOUR ROLE:
- Assist physicians with clinical decision-making
- Suggest differential diagnoses based on symptoms and test results
- Recommend appropriate diagnostic tests (HSAT vs PSG vs PFT)
- Provide treatment recommendations (CPAP settings, medication, lifestyle)
- Help interpret sleep study results (AHI, oxygen saturation, sleep stages)
- Flag safety concerns and contraindications

CAPABILITIES:
- Review patient medical history and current medications
- Analyze sleep study data (AHI, desaturation events, sleep efficiency)
- Interpret PFT results (FEV1, FVC, DLCO)
- Suggest CPAP pressure settings based on titration data
- Recommend follow-up intervals and monitoring plans
- Provide patient education talking points

IMPORTANT PRINCIPLES:
- You are an ASSISTANT - never make definitive diagnoses or treatment decisions
- Always provide evidence-based recommendations with citations when possible
- Consider patient comorbidities, medications, and contraindications
- Prioritize patient safety above all else
- Be concise but thorough in recommendations
- If uncertain, recommend human physician review
- Always mention confidence level in your assessments

RESPONSE FORMAT:
1. Brief assessment of the situation
2. Key findings from patient data/tests
3. Differential diagnoses (if applicable)
4. Recommended next steps
5. Safety considerations
6. Confidence level (high/medium/low)`

  async process(input: string, context: AgentContext): Promise<AgentMessage> {
    // Load comprehensive context
    const agentContext = await AgentContextLoader.buildAgentContext({
      userId: context.userId,
      patientId: context.patientId,
      query: input,
      task: context.metadata?.task as string
    })

    // Build messages with full context
    const messages: AgentMessage[] = [
      {
        role: 'system',
        content: this.config.systemPrompt || PhysicianAgent.SYSTEM_PROMPT
      }
    ]

    // Add patient context if available
    if (agentContext.patient) {
      messages.push({
        role: 'system',
        content: this.formatPatientContext(agentContext.patient)
      })
    }

    // Add clinical guidelines if available
    if (agentContext.clinical) {
      messages.push({
        role: 'system',
        content: `Relevant Clinical Guidelines:\n${agentContext.clinical.guidelines.join('\n')}`
      })
    }

    // Add user query
    messages.push({
      role: 'user',
      content: input
    })

    // Call LLM with full context
    return await this.callLLM(messages)
  }


  private formatPatientContext(patient: any): string {
    return `PATIENT INFORMATION:
Name: ${patient.name}
Age: ${patient.age} years
DOB: ${patient.dateOfBirth}

ALLERGIES: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None documented'}

CURRENT MEDICATIONS:
${patient.currentMedications.length > 0 
  ? patient.currentMedications.map((med: any) => 
      `- ${med.name} ${med.dosage} ${med.frequency} (started: ${med.startDate})`
    ).join('\n')
  : 'None documented'}

RECENT ENCOUNTERS:
${patient.recentEncounters.length > 0
  ? patient.recentEncounters.map((enc: any, idx: number) => 
      `${idx + 1}. ${enc.date} - ${enc.type}: ${enc.chiefComplaint}`
    ).join('\n')
  : 'No recent encounters'}

VITAL SIGNS:
- BP: ${patient.vitalSigns?.bloodPressure || 'Not recorded'}
- HR: ${patient.vitalSigns?.heartRate || 'Not recorded'} bpm
- Weight: ${patient.vitalSigns?.weight || 'Not recorded'} kg
- Height: ${patient.vitalSigns?.height || 'Not recorded'} cm`
  }
}
