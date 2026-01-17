import { NextRequest, NextResponse } from 'next/server'
import { builder } from '@builder.io/sdk'
import { BUILDER_API_KEY } from '@/lib/builder/builder-config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  // Enable Builder.io preview mode
  builder.setUserAttributes({
    urlPath: url,
  })

  return NextResponse.json({ preview: true })
}
