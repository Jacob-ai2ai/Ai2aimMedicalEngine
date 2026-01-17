import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI2AIM RX Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive medical RX management with AI agents and automation
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Medical Management</CardTitle>
              <CardDescription>
                Complete prescription, patient, and communication management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Prescription workflow</li>
                <li>✓ Patient records</li>
                <li>✓ Medical communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Agents</CardTitle>
              <CardDescription>
                Role-based AI agents for automated medical tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Pharmacist Agent</li>
                <li>✓ Physician Agent</li>
                <li>✓ Encoding Agents</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automation</CardTitle>
              <CardDescription>
                Comprehensive automation for all business functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Event triggers</li>
                <li>✓ Scheduled tasks</li>
                <li>✓ Workflow automation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
