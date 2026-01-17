import { createServiceRoleClient } from "@/lib/supabase/client"

export interface DocumentEmbedding {
  id: string
  content: string
  embedding: number[]
  metadata?: Record<string, unknown>
}

export class VectorStore {
  private supabase = createServiceRoleClient()

  /**
   * Generate embedding for text (placeholder - will use OpenAI/Anthropic)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Placeholder - in production, call OpenAI or Anthropic API
    // For now, return a mock embedding
    return new Array(1536).fill(0).map(() => Math.random())
  }

  /**
   * Store document with embedding
   */
  async storeDocument(
    title: string,
    content: string,
    documentType?: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const embedding = await this.generateEmbedding(content)

    const { data, error } = await this.supabase
      .from("rag_documents")
      .insert({
        title,
        content,
        document_type: documentType,
        embedding: `[${embedding.join(",")}]`,
        metadata: metadata || {},
      })
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(`Failed to store document: ${error?.message}`)
    }

    return data.id
  }

  /**
   * Search for similar documents using vector similarity
   */
  async searchSimilar(
    query: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<Array<{ id: string; title: string; content: string; similarity: number; metadata?: Record<string, unknown> }>> {
    const queryEmbedding = await this.generateEmbedding(query)

    // Use pgvector cosine similarity search
    const { data, error } = await this.supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      throw new Error(`Failed to search documents: ${error.message}`)
    }

    return (
      data?.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        similarity: doc.similarity,
        metadata: doc.metadata,
      })) || []
    )
  }

  /**
   * Update document embedding
   */
  async updateDocumentEmbedding(documentId: string, content: string): Promise<void> {
    const embedding = await this.generateEmbedding(content)

    const { error } = await this.supabase
      .from("rag_documents")
      .update({
        content,
        embedding: `[${embedding.join(",")}]`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`)
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    const { error } = await this.supabase.from("rag_documents").delete().eq("id", documentId)

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`)
    }
  }
}

export const vectorStore = new VectorStore()
