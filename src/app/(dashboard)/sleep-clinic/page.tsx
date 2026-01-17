/**
 * Sleep Clinic Dashboard
 * Overview of referrals, HSATs, PFTs, CPAP setups, billing, and AR
 */

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Dummy data for demonstration
const DUMMY_DATA = {
  overview: {
    activeReferrals: 24,
    pendingHSATs: 12,
    scheduledPFTs: 8,
    awaitingInterpretation: 15,
    cpapSetupsThisWeek: 6,
    unpaidInvoices: 18,
    pendingClaims: 22,
    arBalance: 45280.50
  },
  recentReferrals: [
    { id: '1', patient: 'John Smith', physician: 'Dr. Anderson', date: '2026-01-15', status: 'pending', urgency: 'high' },
    { id: '2', patient: 'Mary Johnson', physician: 'Dr. Lee', date: '2026-01-14', status: 'scheduled', urgency: 'normal' },
    { id: '3', patient: 'Bob Wilson', physician: 'Dr. Chen', date: '2026-01-13', status: 'completed', urgency: 'low' }
  ],
  activeHSATs: [
    { id: '1', patient: 'John Smith', device: 'ApneaLink Air', sentDate: '2026-01-16', status: 'out', dueDate: '2026-01-23' },
    { id: '2', patient: 'Sarah Davis', device: 'WatchPAT ONE', sentDate: '2026-01-15', status: 'returned', dueDate: '2026-01-22' }
  ],
  pendingInterpretations: [
    { id: '1', patient: 'Sarah Davis', studyType: 'HSAT', completedDate: '2026-01-17', ahi: 28.5, status: 'pending' },
    { id: '2', patient: 'Mike Brown', studyType: 'PFT', completedDate: '2026-01-16', fev1: 72, status: 'pending' }
  ],
  recentInvoices: [
    { id: 'INV-2601-001', patient: 'John Smith', service: 'HSAT', amount: 850.00, status: 'unpaid', dueDate: '2026-02-15' },
    { id: 'INV-2601-002', patient: 'Mary Johnson', service: 'CPAP Setup', amount: 1250.00, status: 'paid', dueDate: '2026-02-14' },
    { id: 'INV-2601-003', patient: 'Bob Wilson', service: 'PFT', amount: 450.00, status: 'pending', dueDate: '2026-02-13' }
  ]
}

export default function SleepClinicDashboard() {
  const { overview, recentReferrals, activeHSATs, pendingInterpretations, recentInvoices } = DUMMY_DATA

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sleep Clinic Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of referrals, studies, billing & AR</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals/new'}>
          + New Referral
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals'}>
          <div className="text-sm text-muted-foreground">Active Referrals</div>
          <div className="text-3xl font-bold">{overview.activeReferrals}</div>
          <div className="text-xs text-green-600 mt-1">View all →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/hsats'}>
          <div className="text-sm text-muted-foreground">Pending HSATs</div>
          <div className="text-3xl font-bold">{overview.pendingHSATs}</div>
          <div className="text-xs text-blue-600 mt-1">Manage →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/pfts'}>
          <div className="text-sm text-muted-foreground">Scheduled PFTs</div>
          <div className="text-3xl font-bold">{overview.scheduledPFTs}</div>
          <div className="text-xs text-purple-600 mt-1">View →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/interpretations'}>
          <div className="text-sm text-muted-foreground">Awaiting Interpretation</div>
          <div className="text-3xl font-bold text-yellow-600">{overview.awaitingInterpretation}</div>
          <div className="text-xs text-yellow-600 mt-1">Urgent →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/cpap'}>
          <div className="text-sm text-muted-foreground">CPAP Setups (This Week)</div>
          <div className="text-3xl font-bold">{overview.cpapSetupsThisWeek}</div>
          <div className="text-xs text-green-600 mt-1">Schedule →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/invoices'}>
          <div className="text-sm text-muted-foreground">Unpaid Invoices</div>
          <div className="text-3xl font-bold text-red-600">{overview.unpaidInvoices}</div>
          <div className="text-xs text-red-600 mt-1">Review →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/claims'}>
          <div className="text-sm text-muted-foreground">Pending Claims</div>
          <div className="text-3xl font-bold">{overview.pendingClaims}</div>
          <div className="text-xs text-orange-600 mt-1">Submit →</div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dashboard/sleep-clinic/ar'}>
          <div className="text-sm text-muted-foreground">AR Balance</div>
          <div className="text-3xl font-bold">${overview.arBalance.toLocaleString()}</div>
          <div className="text-xs text-blue-600 mt-1">Manage →</div>
        </Card>
      </div>

      {/* Recent Referrals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Referrals</h2>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals'}>
            View All
          </Button>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {recentReferrals.map(ref => (
              <div key={ref.id} className="flex items-center justify-between p-4 border rounded hover:bg-muted cursor-pointer" onClick={() => window.location.href = `/dashboard/sleep-clinic/referrals/${ref.id}`}>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold">{ref.patient}</div>
                    <div className="text-sm text-muted-foreground">Referred by {ref.physician}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">{ref.date}</div>
                  <Badge variant={ref.status === 'pending' ? 'destructive' : ref.status === 'scheduled' ? 'default' : 'secondary'}>
                    {ref.status}
                  </Badge>
                  <Badge variant={ref.urgency === 'high' ? 'destructive' : 'secondary'}>
                    {ref.urgency}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active HSATs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Active Home Sleep Studies</h2>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/hsats'}>
            Manage All
          </Button>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {activeHSATs.map(hsat => (
              <div key={hsat.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-semibold">{hsat.patient}</div>
                  <div className="text-sm text-muted-foreground">Device: {hsat.device}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <div>Sent: {hsat.sentDate}</div>
                    <div>Due: {hsat.dueDate}</div>
                  </div>
                  <Badge variant={hsat.status === 'out' ? 'default' : 'secondary'}>
                    {hsat.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending Interpretations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Pending Interpretations</h2>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/interpretations'}>
            Review All
          </Button>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {pendingInterpretations.map(interp => (
              <div key={interp.id} className="flex items-center justify-between p-4 border rounded hover:bg-yellow-50 cursor-pointer" onClick={() => window.location.href = `/dashboard/sleep-clinic/interpretations/${interp.id}`}>
                <div>
                  <div className="font-semibold">{interp.patient}</div>
                  <div className="text-sm text-muted-foreground">{interp.studyType} - {interp.completedDate}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">
                    {interp.studyType === 'HSAT' && `AHI: ${interp.ahi}`}
                    {interp.studyType === 'PFT' && `FEV1: ${interp.fev1}%`}
                  </div>
                  <Badge variant="destructive">{interp.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Invoices</h2>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/invoices'}>
            View All
          </Button>
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {recentInvoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-semibold">{inv.id}</div>
                  <div className="text-sm text-muted-foreground">{inv.patient} - {inv.service}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold">${inv.amount.toFixed(2)}</div>
                  <Badge variant={inv.status === 'unpaid' ? 'destructive' : inv.status === 'paid' ? 'default' : 'secondary'}>
                    {inv.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">Due: {inv.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals/new'}>
            📋 New Referral
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/hsats/dispatch'}>
            📦 Dispatch HSAT
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/pfts/schedule'}>
            🫁 Schedule PFT
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/cpap/setup'}>
            😴 CPAP Setup
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/invoices/new'}>
            💵 Create Invoice
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/claims/submit'}>
            📄 Submit Claim
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/payments'}>
            💳 Record Payment
          </Button>
          <Button variant="outline" className="h-20" onClick={() => window.location.href = '/dashboard/sleep-clinic/reports'}>
            📊 View Reports
          </Button>
        </div>
      </Card>
    </div>
  )
}
