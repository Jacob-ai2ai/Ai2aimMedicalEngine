/**
 * RAG (Retrieval Augmented Generation) Service
 * Document embedding and semantic search
 */

import { OpenAIClient } from './openai-client'
import { createServerSupabase } from '@/lib/supabase/server'

export interface DocumentEmbedding {
  id: string
  content: string
  embedding: number[]
  metadata?: Record<string, any>
}

export class RAGService {
  /**
   * Generate embedding for document content
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    return await OpenAIClient.generateEmbedding(text)
  }

  /**
   * Store document with embedding in database
   */
  static async storeDocument(
    content: string,
    metadata: {
      documentType: string
      patientId?: string
      title?: string
      source?: string
    }
  ): Promise<string> {
    const supabase = await createServerSupabase()

    // Generate embedding
    const embedding = await this.generateEmbedding(content)

    // Store in database
    const { data, error } = await supabase
      .from('rag_documents')
      .insert({
        content,
        embedding: JSON.stringify(embedding), // Store as JSON
        metadata,
        document_type: metadata.documentType
      })
      .select('id')
      .single()

    if (error) throw error

    return data.id
  }

  /**
   * Semantic search across documents
   */
  static async semanticSearch(
    query: string,
    options: {
      limit?: number
      threshold?: number
      documentType?: string
      patientId?: string
    } = {}
  ): Promise<Array<{
    id: string
    content: string
    similarity: number
    metadata: any
  }>> {
    const supabase = await createServerSupabase()

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query)

    // Search using vector similarity (if pgvector is enabled)
    // For now, return mock results
    // In production, would use: SELECT * FROM match_documents(query_embedding, match_threshold, match_count)
    
    const { data, error } = await supabase
      .from('rag_documents')
      .select('*')
      .limit(options.limit || 10)

    if (error) throw error

    // Calculate similarity manually (in production, database would do this)
    const results = (data || []).map(doc => {
      const docEmbedding = JSON.parse(doc.embedding || '[]')
      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding)
      
      return {
        id: doc.id,
        content: doc.content,
        similarity,
        metadata: doc.metadata
      }
    })

    // Filter by threshold and sort by similarity
    return results
      .filter(r => r.similarity >= (options.threshold || 0.7))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || 10)
  }

  /**
   * Get relevant context for AI query
   */
  static async getRelevantContext(
    query: string,
    maxTokens: number = 2000
  ): Promise<string> {
    const results = await this.semanticSearch(query, { limit: 5, threshold: 0.75 })
    
    let context = ''
    let tokenCount = 0

    for (const result of results) {
      const chunk = `\n---\n${result.content}\n`
      const estimatedTokens = chunk.length / 4 // Rough estimate
      
      if (tokenCount + estimatedTokens <= maxTokens) {
        context += chunk
        tokenCount += estimatedTokens
      } else {
        break
      }
    }

    return context
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Chunk large document into smaller pieces
   */
  static chunkDocument(
    content: string,
    chunkSize: number = 1000,
    overlap: number = 200
  ): string[] {
    const chunks: string[] = []
    let start = 0

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length)
      chunks.push(content.substring(start, end))
      start += chunkSize - overlap
    }

    return chunks
  }

  /**
   * Ingest document with chunking
   */
  static async ingestDocument(
    content: string,
    metadata: {
      documentType: string
      title: string
      patientId?: string
      source?: string
    }
  ): Promise<string[]> {
    const chunks = this.chunkDocument(content)
    const documentIds: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunkMetadata = {
        ...metadata,
        chunkIndex: i,
        totalChunks: chunks.length
      }

      const id = await this.storeDocument(chunks[i], chunkMetadata)
      documentIds.push(id)
    }

    return documentIds
  }

  /**
   * Ingest workflow documentation for AI assistant
   */
  static async ingestWorkflowDocumentation(): Promise<void> {
    const workflowDocs = `
# Workflow Automation System

## Available Node Types

### Triggers
- Event Trigger: Fires on database events (e.g., sleep_study.created, dme_prescription.created)
- Schedule Trigger: Fires on schedule (daily, weekly, hourly)

### Actions
- Database: Query or update database tables
- API Call: Call external APIs
- Notification: Send notifications via communications table
- AI Agent: Invoke AI agents for processing

### Sleep Clinic Nodes
- CPAP Compliance: Check compliance, sync data, calculate metrics
- DME Equipment: Manage equipment inventory and assignments
- Sleep Study: Dispatch monitors, track returns, manage studies
- PFT Test: Schedule tests, record results, generate interpretations
- Compliance Check: General patient compliance monitoring
- Referral: Process referral forms

### Logic Nodes
- Condition: Branch based on data conditions
- Delay: Wait for specified time
- Loop: Repeat actions
- Merge: Combine parallel branches
- Split: Create parallel branches

## API Endpoints

### CPAP Compliance
- GET /api/cpap/compliance/[patientId] - Get patient compliance
- GET /api/cpap/compliance/non-compliant - Get non-compliant patients
- POST /api/cpap/compliance/[patientId]/sync - Sync device data

### DME Equipment
- GET /api/dme/equipment - List equipment
- POST /api/dme/equipment - Create equipment
- PATCH /api/dme/inventory/[id]/assign - Assign equipment to patient

### Sleep Studies
- GET /api/sleep-studies - List studies
- POST /api/sleep-studies - Create study
- PATCH /api/sleep-studies/[id]/dispatch - Dispatch monitor

### PFT Tests
- GET /api/pft/tests - List tests
- POST /api/pft/tests - Create test
- POST /api/pft/tests/[id]/results - Record results

## Database Tables

- patients: Patient records
- dme_prescriptions: DME prescriptions
- dme_inventory: Equipment inventory
- cpap_compliance: CPAP compliance data
- sleep_studies: Sleep study records
- pft_tests: PFT test records
- pft_results: PFT test results
- referral_forms: Referral form records
- communications: Notifications and messages
- tasks: Task assignments

## Common Workflow Patterns

1. Event → Check Condition → Action → Notification
2. Schedule → Query Database → Filter → Generate Report
3. Event → Extract Data → Validate → Create Record → Notify
4. Schedule → Check Status → Condition → Alert if Needed
`

    await this.ingestDocument(workflowDocs, {
      documentType: 'workflow-documentation',
      title: 'Workflow Automation System Documentation',
      source: 'system'
    })
  }

  /**
   * Ingest API schema documentation
   */
  static async ingestAPISchema(): Promise<void> {
    // This would fetch and ingest API documentation
    // For now, we'll create a summary
    const apiSchema = `
# API Schema Documentation

## Request/Response Formats

### CPAP Compliance
Request: GET /api/cpap/compliance/[patientId]
Response: { compliance: number, daysUsed: number, averageHours: number }

### DME Equipment
Request: POST /api/dme/equipment
Body: { name: string, category: string, insurance_code?: string }
Response: { id: string, ...equipment }

### Sleep Studies
Request: POST /api/sleep-studies
Body: { patient_id: string, study_type: string, scheduled_date: string }
Response: { id: string, ...study }
`

    await this.ingestDocument(apiSchema, {
      documentType: 'api-schema',
      title: 'API Schema Documentation',
      source: 'system'
    })
  }
}
