import { vectorStore } from "./vector-store"
import { createServiceRoleClient } from "@/lib/supabase/client"

export interface IngestedDocument {
  id: string
  title: string
  content: string
  type: string
  metadata: Record<string, unknown>
}

export class DocumentIngestionPipeline {
  private supabase = createServiceRoleClient()

  /**
   * Ingest a document into the RAG system
   */
  async ingestDocument(
    title: string,
    content: string,
    documentType: string,
    source?: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    // Store in vector database
    const documentId = await vectorStore.storeDocument(title, content, documentType, {
      source,
      ...metadata,
    })

    return documentId
  }

  /**
   * Ingest multiple documents in batch
   */
  async ingestDocuments(documents: IngestedDocument[]): Promise<string[]> {
    const documentIds: string[] = []

    for (const doc of documents) {
      try {
        const id = await this.ingestDocument(
          doc.title,
          doc.content,
          doc.type,
          undefined,
          doc.metadata
        )
        documentIds.push(id)
      } catch (error) {
        console.error(`Failed to ingest document ${doc.title}:`, error)
      }
    }

    return documentIds
  }

  /**
   * Ingest communication as document
   */
  async ingestCommunication(communicationId: string): Promise<string> {
    const { data: communication } = await this.supabase
      .from("communications")
      .select("*")
      .eq("id", communicationId)
      .single()

    if (!communication) {
      throw new Error(`Communication not found: ${communicationId}`)
    }

    const title = communication.subject || `Communication ${communication.id}`
    const content = communication.content
    const documentType = communication.communication_type

    return this.ingestDocument(title, content, documentType, "communication", {
      communicationId: communication.id,
      direction: communication.direction,
      patientId: communication.patient_id,
    })
  }

  /**
   * Ingest prescription as document
   */
  async ingestPrescription(prescriptionId: string): Promise<string> {
    const { data: prescription } = await this.supabase
      .from("prescriptions")
      .select(`
        *,
        patients:patient_id (
          first_name,
          last_name
        ),
        medications:medication_id (
          name
        )
      `)
      .eq("id", prescriptionId)
      .single()

    if (!prescription) {
      throw new Error(`Prescription not found: ${prescriptionId}`)
    }

    const title = `Prescription ${prescription.prescription_number}`
    const content = `Prescription for ${prescription.patients?.first_name} ${prescription.patients?.last_name}
Medication: ${prescription.medications?.name}
Dosage: ${prescription.dosage}
Quantity: ${prescription.quantity}
Instructions: ${prescription.instructions || "N/A"}
Status: ${prescription.status}`

    return this.ingestDocument(title, content, "prescription", "prescription", {
      prescriptionId: prescription.id,
      patientId: prescription.patient_id,
      status: prescription.status,
    })
  }
}

export const documentIngestion = new DocumentIngestionPipeline()
