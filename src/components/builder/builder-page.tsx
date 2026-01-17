'use client'

import { BuilderComponent, useIsPreviewing, Builder } from '@builder.io/react'
import { builder } from '@builder.io/react'
import { useEffect, useState } from 'react'
import { BUILDER_API_KEY } from '@/lib/builder/builder-config'

// Register your components for use in Builder.io
// You can add your custom components here
Builder.registerComponent(() => {
  return (
    <div className="p-4 bg-blue-100 rounded">
      <h2>Custom Component</h2>
      <p>This is a custom component registered with Builder.io</p>
    </div>
  )
}, {
  name: 'CustomComponent',
  inputs: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Default Title',
    },
  ],
})

interface BuilderPageProps {
  model?: string
  content?: any
  apiKey?: string
}

export function BuilderPage({ model = 'page', content, apiKey }: BuilderPageProps) {
  const isPreviewing = useIsPreviewing()
  const [builderContent, setBuilderContent] = useState(content)

  useEffect(() => {
    if (!content && !isPreviewing && BUILDER_API_KEY) {
      // Fetch content from Builder.io
      builder
        .get(model, {
          apiKey: apiKey || BUILDER_API_KEY,
        })
        .promise()
        .then((fetchedContent) => {
          setBuilderContent(fetchedContent)
        })
        .catch((error) => {
          console.error('Error fetching Builder.io content:', error)
        })
    }
  }, [content, isPreviewing, model, apiKey])

  if (!builderContent && !isPreviewing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Content Found</h2>
          <p className="text-gray-600">
            Create content in Builder.io or set up your API key.
          </p>
        </div>
      </div>
    )
  }

  return (
    <BuilderComponent
      model={model}
      content={builderContent}
      apiKey={apiKey || BUILDER_API_KEY}
    />
  )
}
