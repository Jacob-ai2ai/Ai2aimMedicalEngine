import { builder } from '@builder.io/react'
import { BuilderComponent } from '@builder.io/react'
import { BUILDER_API_KEY, BUILDER_MODELS } from '@/lib/builder/builder-config'

interface BuilderPageProps {
  params: {
    path?: string[]
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function BuilderPage({ params, searchParams }: BuilderPageProps) {
  const path = params.path || []
  const urlPath = '/' + path.join('/')

  // Fetch Builder.io content
  const page = await builder
    .get(BUILDER_MODELS.PAGE, {
      apiKey: BUILDER_API_KEY,
      userAttributes: {
        urlPath,
      },
      options: {
        includeRefs: true,
      },
    })
    .toPromise()

  // If no page found, return 404
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

// Enable Builder.io preview mode
export async function generateStaticParams() {
  return []
}
