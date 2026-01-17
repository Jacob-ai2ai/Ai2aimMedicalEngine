// This layout ensures Builder.io components are registered
import '@/lib/builder/builder-components'

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
