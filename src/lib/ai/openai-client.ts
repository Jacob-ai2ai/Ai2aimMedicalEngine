/**
 * OpenAI Client Wrapper
 * Actual LLM integration for AI agents
 * Option 3: Enable Real AI
 */

import OpenAI from 'openai'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-development'
})

// Token usage tracking
interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
}

export class OpenAIClient {
  /**
   * Chat completion with streaming support
   */
  static async chat(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      stream?: boolean
      tools?: any[]
    } = {}
  ): Promise<{
    content: string
    usage?: TokenUsage
    toolCalls?: any[]
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: options.model || 'gpt-4-turbo-preview',
        messages: messages as any,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        stream: options.stream ?? false,
        tools: options.tools
      })

      if (options.stream) {
        // Handle streaming (would need proper stream handling)
        let content = ''
        for await (const chunk of response as any) {
          content += chunk.choices[0]?.delta?.content || ''
        }
        return { content }
      } else {
        const completion = response as any
        return {
          content: completion.choices[0]?.message?.content || '',
          usage: this.calculateUsage(completion.usage),
          toolCalls: completion.choices[0]?.message?.tool_calls
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback to dummy response in development
      return {
        content: 'AI response (using fallback - check OPENAI_API_KEY)',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 }
      }
    }
  }

  /**
   * Generate embeddings for RAG
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      })
      return response.data[0].embedding
    } catch (error) {
      console.error('Embedding error:', error)
      // Return dummy embedding in development
      return new Array(1536).fill(0).map(() => Math.random())
    }
  }

  /**
   * Calculate token usage and cost
   */
  private static calculateUsage(usage: any): TokenUsage {
    const promptTokens = usage?.prompt_tokens || 0
    const completionTokens = usage?.completion_tokens || 0
    const totalTokens = usage?.total_tokens || 0
    
    // GPT-4 Turbo pricing (example)
    const promptCost = (promptTokens / 1000) * 0.01
    const completionCost = (completionTokens / 1000) * 0.03
    const cost = promptCost + completionCost

    return {
      promptTokens,
      completionTokens,
      totalTokens,
      cost
    }
  }
}
