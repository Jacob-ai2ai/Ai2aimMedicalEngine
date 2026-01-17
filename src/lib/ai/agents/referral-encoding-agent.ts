/**
 * Referral Encoding AI Agent
 * Automatically extracts and encodes referral information from documents
 * Processes physician referrals and initiates the sleep clinic workflow
 */

import { BaseAgent } from '../base-agent'
import { AgentMessage, AgentContext } from '@/types/ai'
import { OpenAIClient } from '../openai-client'

export class ReferralEncodingAgent extends BaseAgent {
  private static SYSTEM_PROMPT = `You are a specialized Referral Encoding AI Agent for a sleep clinic.

YOUR MISSION:
Extract and structure referral information from physician referral forms to automatically populate the system and initiate the patient care workflow.

INFORMATION TO EXTRACT:
1. PATIENT INFORMATION:
   - Full name, date of birth, gender
   - Contact information (phone, email, address)
   - Insurance provider and policy number
   - MRN (if existing patient)

2. REFERRING PHYSICIAN:
   - Physician name and credentials
   - Clinic/practice name
   - Contact information (phone, fax)
   - NPI number (if available)

3. CLINICAL INFORMATION:
   - Reason for referral
   - Chief complaint / symptoms
   - Relevant medical history
   - Current medications
   - Known allergies
   - Requested tests (HSAT, PSG, PFT, Consultation)

4. ADMINISTRATIVE:
   - Referral date
   - Urgency level (urgent, high, normal, low)
   - Authorization number (if applicable)
   - Special instructions or notes

OUTPUT FORMAT:
Return a structured JSON object with all extracted fields. If information is missing or unclear, mark as null and flag for manual review.

QUALITY STANDARDS:
- Accuracy is critical - if uncertain, flag for human review
- Extract exact wording for clinical information
- Validate formatting (dates, phone numbers, etc.)
- Identify urgency indicators (STAT, urgent, severe symptoms)
- Flag incomplete referrals`

  constructor() {
    super(
      'referral-encoding-agent',
      'Referral Encoding AI Assistant',
      'administrative',
      'encoding',
      'AI agent specialized in processing and encoding referral documents',
      [
        { name: 'Referral Extraction', description: 'Extract referral information from documents', enabled: true },
        { name: 'Provider Identification', description: 'Identify and verify referring providers', enabled: true },
        { name: 'Patient Data Extraction', description: 'Extract patient demographics and clinical info', enabled: true },
        { name: 'Referral Encoding', description: 'Encode referral data into system', enabled: true },
        { name: 'Urgency Assessment', description: 'Determine referral priority level', enabled: true }
      ],
      {
        model: 'gpt-4-turbo-preview',
        temperature: 0.1, // Very low for accuracy
        maxTokens: 2000,
        systemPrompt: ReferralEncodingAgent.SYSTEM_PROMPT
      }
    )
  }

  async process(input: string, context: AgentContext): Promise<AgentMessage> {
    // Build messages for extraction
    const messages: AgentMessage[] = [
      {
        role: 'system',
        content: ReferralEncodingAgent.SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `Extract and encode the following referral form:\n\n${input}\n\nReturn structured JSON with all fields.`
      }
    ]

    // Call LLM to extract structured data
    return await this.callLLM(messages)
  }

  /**
   * Process a referral document and encode into system
   */
  static async processReferralDocument(documentText: string): Promise<{
    extractedData: ReferralData
    confidence: number
    flagsForReview: string[]
  }> {
    const agent = new ReferralEncodingAgent()
    
    const response = await agent.process(documentText, {})
    
    // Parse JSON from AI response
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0])
        
        // Assess confidence and flags
        const flags: string[] = []
        let confidence = 1.0

        // Check for missing critical fields
        if (!extractedData.patient?.name) {
          flags.push('Missing patient name')
          confidence -= 0.3
        }
        if (!extractedData.referringPhysician?.name) {
          flags.push('Missing referring physician')
          confidence -= 0.2
        }
        if (!extractedData.clinical?.reasonForReferral) {
          flags.push('Missing reason for referral')
          confidence -= 0.2
        }

        return {
          extractedData,
          confidence: Math.max(0, confidence),
          flagsForReview: flags
        }
      }
    } catch (error) {
      console.error('Failed to parse referral extraction:', error)
    }

    return {
      extractedData: {},
      confidence: 0,
      flagsForReview: ['AI extraction failed - manual review required']
    }
  }
}

export interface ReferralData {
  patient?: {
    name: string
    dateOfBirth: string
    phone: string
    email?: string
    address?: string
    insuranceProvider?: string
    policyNumber?: string
    mrn?: string
  }
  referringPhysician?: {
    name: string
    clinic: string
    phone: string
    fax?: string
    npi?: string
  }
  clinical?: {
    reasonForReferral: string
    chiefComplaint: string
    medicalHistory?: string
    currentMedications?: string[]
    allergies?: string[]
    requestedTests: string[]
  }
  administrative?: {
    referralDate: string
    urgency: 'urgent' | 'high' | 'normal' | 'low'
    authorizationNumber?: string
    specialInstructions?: string
  }
}
