import { builder } from '@builder.io/react'

// Initialize Builder.io
// Get your API key from https://www.builder.io/c/docs/getting-started
export const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || ''

if (BUILDER_API_KEY) {
  builder.init(BUILDER_API_KEY)
} else {
  console.warn('Builder.io API key not found. Set NEXT_PUBLIC_BUILDER_API_KEY in .env.local')
}

// Builder.io model names
export const BUILDER_MODELS = {
  PAGE: 'page',
  COMPONENT: 'component',
  SYMBOL: 'symbol',
} as const

// Builder.io content types
export const BUILDER_CONTENT_TYPES = {
  PAGE: 'page',
  COMPONENT: 'component',
} as const
