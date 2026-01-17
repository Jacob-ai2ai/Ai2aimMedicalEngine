import { BaseEncodingAgent } from "./base-encoding-agent"
import { AgentContext, AgentCapability } from "@/types/ai"

export class DocumentEncodingAgent extends BaseEncodingAgent {
  constructor(id: string) {
    const capabilities: AgentCapability[] = [
      {
        name: "document_extraction",
        description: "Extract structured data from documents",
        enabled: true,
      },
      {
        name: "type_identification",
        description: "Identify document types",
        enabled: true,
      },
      {
        name: "data_encoding",
        description: "Encode document data",
        enabled: true,
      },
      {
        name: "quality_assurance",
        description: "Ensure data quality",
        enabled: true,
      },
    ]

    super(
      id,
      "Document Encoding Agent",
      "AI agent specialized in extracting structured data from various documents",
      capabilities
    )
  }

  async extractStructuredData(
    content: string,
    context: AgentContext
  ): Promise<Record<string, unknown>> {
    const documentType = this.identifyDocumentType(content)

    return {
      type: "document",
      documentType,
      extractedFields: this.extractFields(content, documentType),
      confidence: this.calculateConfidence(content),
      qualityScore: this.assessQuality(content),
      extractedAt: new Date().toISOString(),
    }
  }

  private identifyDocumentType(content: string): string {
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes("prescription") || lowerContent.includes("rx")) {
      return "prescription"
    }
    if (lowerContent.includes("lab") || lowerContent.includes("test result")) {
      return "lab_result"
    }
    if (lowerContent.includes("referral")) {
      return "referral"
    }
    if (lowerContent.includes("letter")) {
      return "letter"
    }
    if (lowerContent.includes("invoice") || lowerContent.includes("bill")) {
      return "invoice"
    }
    return "unknown"
  }

  private extractFields(content: string, documentType: string): Record<string, unknown> {
    const fields: Record<string, unknown> = {}

    // Extract common fields
    const dateMatch = content.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    if (dateMatch) {
      fields.date = dateMatch[0]
    }

    // Extract fields based on document type
    switch (documentType) {
      case "prescription":
        fields.medication = this.extractMedication(content)
        fields.dosage = this.extractDosage(content)
        break
      case "lab_result":
        fields.testName = this.extractTestName(content)
        fields.result = this.extractTestResult(content)
        break
      default:
        break
    }

    return fields
  }

  private extractMedication(content: string): string | null {
    const medicationMatch = content.match(/medication[:\s]+(.+)/i)
    return medicationMatch ? medicationMatch[1].trim() : null
  }

  private extractDosage(content: string): string | null {
    const dosageMatch = content.match(/dosage[:\s]+(.+)/i)
    return dosageMatch ? dosageMatch[1].trim() : null
  }

  private extractTestName(content: string): string | null {
    const testMatch = content.match(/test[:\s]+(.+?)(?:\n|result)/i)
    return testMatch ? testMatch[1].trim() : null
  }

  private extractTestResult(content: string): string | null {
    const resultMatch = content.match(/result[:\s]+(.+)/i)
    return resultMatch ? resultMatch[1].trim() : null
  }

  private calculateConfidence(content: string): number {
    // Simple confidence calculation - in production, use LLM
    const hasDate = /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(content)
    const hasName = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(content)
    let confidence = 0.5
    if (hasDate) confidence += 0.2
    if (hasName) confidence += 0.3
    return Math.min(confidence, 1.0)
  }

  private assessQuality(content: string): "high" | "medium" | "low" {
    const length = content.length
    const hasStructure = content.includes(":") || content.includes("\n")
    if (length > 200 && hasStructure) {
      return "high"
    }
    if (length > 100) {
      return "medium"
    }
    return "low"
  }
}
