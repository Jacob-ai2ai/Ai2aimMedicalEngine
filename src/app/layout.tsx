import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// Builder.io components are registered in builder-components.tsx
// They will be loaded when Builder.io pages are accessed

import { SkinProvider } from "@/components/theme/skin-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI2AIM RX - Medical Platform",
  description: "Comprehensive medical RX management platform with AI agents and automation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkinProvider>
          {children}
          <Toaster position="top-right" />
        </SkinProvider>
      </body>
    </html>
  )
}
