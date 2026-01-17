import { BaseEncodingAgent } from "./base-encoding-agent"
import { AgentContext, AgentCapability } from "@/types/ai"

export class ReferralEncodingAgent extends BaseEncodingAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "referral_extraction",
        description: "Extract referral information",
        enabled: true,
      },
      {
        name: "provider_identification",
        description: "Identify referring and receiving providers",
        enabled: true,
      },
      {
        name: "patient_data_extraction",
        description: "Extract patient information from referrals",
        enabled: true,
      },
      {
        name: "referral_encoding",
        description: "Encode referral data into structured format",
        enabled: true,
      },
    ]

    super(
      id,
      "Referral Encoding Agent",
      "AI agent specialized in processing and encoding referral documents",
      capabilities
    )
  }

  async extractStructuredData(
    content: string,
    context: AgentContext
  ): Promise<Record<string, unknown>> {
    return {
      type: "referral",
      referringProvider: this.extractReferringProvider(content),
      receivingProvider: this.extractReceivingProvider(content),
      patientName: this.extractPatientName(content),
      patientDOB: this.extractPatientDOB(content),
      reasonForReferral: this.extractReasonForReferral(content),
      urgency: this.assessUrgency(content),
      specialty: this.extractSpecialty(content),
      extractedAt: new Date().toISOString(),
    }
  }

  private extractReferringProvider(content: string): Record<string, string> | null {
    // Extract referring provider information
    const providerMatch = content.match(/referring\s+provider[:\s]+(.+)/i)
    return providerMatch
      ? {
          name: providerMatch[1].trim(),
        }
      : null
  }

  private extractReceivingProvider(content: string): Record<string, string> | null {
    // Extract receiving provider information
    const providerMatch = content.match(/receiving\s+provider[:\s]+(.+)/i)
    return providerMatch
      ? {
          name: providerMatch[1].trim(),
        }
      : null
  }

  private extractPatientName(content: string): string | null {
    // Extract patient name
    const nameMatch = content.match(/patient[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
    return nameMatch ? nameMatch[1].trim() : null
  }

  private extractPatientDOB(content: string): string | null {
    // Extract patient date of birth
    const dobMatch = content.match(/dob[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
    return dobMatch ? dobMatch[1] : null
  }

  private extractReasonForReferral(content: string): string | null {
    // Extract reason for referral
    const reasonMatch = content.match(/reason[:\s]+(.+?)(?:\n|$)/i)
    return reasonMatch ? reasonMatch[1].trim() : null
  }

  private assessUrgency(content: string): "low" | "medium" | "high" {
    const urgentKeywords = ["urgent", "asap", "immediate", "emergency"]
    const lowerContent = content.toLowerCase()
    if (urgentKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "high"
    }
    return "medium"
  }

  private extractSpecialty(content: string): string | null {
    // Extract specialty
    const specialtyMatch = content.match(/specialty[:\s]+(.+)/i)
    return specialtyMatch ? specialtyMatch[1].trim() : null
  }
}
