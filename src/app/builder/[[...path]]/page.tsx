'use client'

import { useEffect, useState } from 'react'
import { BuilderComponent } from '@builder.io/react'
import { BUILDER_API_KEY, BUILDER_MODELS } from '@/lib/builder/builder-config'

interface BuilderPageProps {
  params: {
    path?: string[]
  }
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = params?.path || []
    const urlPath = '/' + path.join('/')

    // Dynamic import to avoid build-time issues
    import('@builder.io/react').then(({ builder }) => {
      builder
        .get(BUILDER_MODELS.PAGE, {
          apiKey: BUILDER_API_KEY,
          userAttributes: {
            urlPath,
          },
        })
        .toPromise()
        .then((content) => {
          setPage(content)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    })
  }, [params])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600">Page not found in Builder.io</p>
        </div>
      </div>
    )
  }

  return (
    <BuilderComponent
      model={BUILDER_MODELS.PAGE}
      content={page}
      apiKey={BUILDER_API_KEY}
    />
  )
}
