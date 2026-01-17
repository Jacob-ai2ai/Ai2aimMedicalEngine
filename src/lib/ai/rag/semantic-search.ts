import { vectorStore } from "./vector-store"
import { AgentContext } from "@/types/ai"

export interface SearchResult {
  id: string
  title: string
  content: string
  similarity: number
  metadata?: Record<string, unknown>
}

export class SemanticSearch {
  /**
   * Search for relevant documents using semantic search
   */
  async search(
    query: string,
    limit: number = 5,
    context?: AgentContext
  ): Promise<SearchResult[]> {
    // Add context to query if available
    let enhancedQuery = query
    if (context?.patientId) {
      enhancedQuery += ` patient ID: ${context.patientId}`
    }
    if (context?.prescriptionId) {
      enhancedQuery += ` prescription ID: ${context.prescriptionId}`
    }

    const results = await vectorStore.searchSimilar(enhancedQuery, limit)

    return results.map((result) => ({
      id: result.id,
      title: result.title,
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
    }))
  }

  /**
   * Retrieve context for an AI agent based on query
   */
  async retrieveContext(
    query: string,
    context: AgentContext,
    limit: number = 3
  ): Promise<string> {
    const results = await this.search(query, limit, context)

    if (results.length === 0) {
      return "No relevant context found."
    }

    // Format results as context string
    const contextParts = results.map(
      (result, index) =>
        `[Context ${index + 1}]\nTitle: ${result.title}\nContent: ${result.content.substring(0, 500)}...`
    )

    return contextParts.join("\n\n")
  }

  /**
   * Search with filters
   */
  async searchWithFilters(
    query: string,
    filters: {
      documentType?: string
      patientId?: string
      dateRange?: { start: string; end: string }
    },
    limit: number = 5
  ): Promise<SearchResult[]> {
    // Basic search first
    const results = await this.search(query, limit * 2)

    // Apply filters
    let filtered = results

    if (filters.documentType) {
      filtered = filtered.filter(
        (r) => r.metadata?.document_type === filters.documentType
      )
    }

    if (filters.patientId) {
      filtered = filtered.filter((r) => r.metadata?.patientId === filters.patientId)
    }

    return filtered.slice(0, limit)
  }
}

export const semanticSearch = new SemanticSearch()
