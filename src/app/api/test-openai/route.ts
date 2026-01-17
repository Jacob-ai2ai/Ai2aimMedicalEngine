/**
 * Test OpenAI Connection
 * Verify API key is working
 */

import { NextRequest, NextResponse } from 'next/server'
import { OpenAIClient } from '@/lib/ai/openai-client'

export async function GET(request: NextRequest) {
  try {
    // Test simple chat completion
    const result = await OpenAIClient.chat([
      { role: 'system', content: 'You are a helpful medical assistant.' },
      { role: 'user', content: 'Say "Hello! OpenAI connection successful." if you can read this.' }
    ], {
      model: 'gpt-4-turbo-preview',
      maxTokens: 50
    })

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is connected and working',
      response: result.content,
      usage: result.usage
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'OpenAI API connection failed - check API key'
    }, { status: 500 })
  }
}
