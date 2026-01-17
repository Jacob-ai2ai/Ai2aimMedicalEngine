/**
 * Insurance Claims Management
 * Submit and track insurance claims for sleep clinic services
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const DUMMY_CLAIMS = [
  {
    id: 'CLM-2601-001',
    claimNumber: 'ABC-2601-0015',
    patient: { name: 'John Smith', mrn: 'MRN-12345', policyNumber: 'ABC-789456' },
    insurance: { provider: 'Alberta Blue Cross', groupNumber: 'GRP-12345' },
    invoiceNumber: 'INV-2601-001',
    submittedDate: '2026-01-16',
    services: [
      { code: 'G0398', description: 'Home Sleep Study', amount: 650.00 }
    ],
    totalAmount: 650.00,
    status: 'submitted',
    expectedPayment: 650.00,
    processingTime: '14-21 days'
  },
  {
    id: 'CLM-2601-002',
    claimNumber: 'MAN-2601-0042',
    patient: { name: 'Mary Johnson', mrn: 'MRN-12346', policyNumber: 'MAN-456123' },
    insurance: { provider: 'Manulife', groupNumber: 'GRP-67890' },
    invoiceNumber: 'INV-2601-002',
    submittedDate: '2026-01-14',
    approvedDate: '2026-01-16',
    services: [
      { code: 'E0601', description: 'CPAP Device', amount: 1000.00 }
    ],
    totalAmount: 1000.00,
    approvedAmount: 1000.00,
    status: 'approved',
    expectedPayment: 1000.00,
    paymentDate: null
  },
  {
    id: 'CLM-2601-003',
    claimNumber: 'SUN-2601-0028',
    patient: { name: 'Robert Wilson', mrn: 'MRN-12347', policyNumber: 'SUN-789012' },
    insurance: { provider: 'Sunlife', groupNumber: 'GRP-34567' },
    invoiceNumber: 'INV-2601-003',
    submittedDate: '2026-01-13',
    deniedDate: '2026-01-17',
    services: [
      { code: '94010', description: 'Spirometry', amount: 400.00 }
    ],
    totalAmount: 400.00,
    status: 'denied',
    denialReason: 'Service not covered under current policy',
    appealDeadline: '2026-02-17'
  },
  {
    id: 'CLM-2601-004',
    claimNumber: 'CAN-2601-0067',
    patient: { name: 'Lisa Brown', mrn: 'MRN-12348', policyNumber: 'CAN-345678' },
    insurance: { provider: 'Canada Life', groupNumber: 'GRP-89012' },
    invoiceNumber: 'INV-2601-004',
    submittedDate: '2026-01-11',
    approvedDate: '2026-01-15',
    paidDate: '2026-01-17',
    services: [
      { code: 'G0398', description: 'Home Sleep Study', amount: 650.00 },
      { code: '99213', description: 'Consultation', amount: 150.00 }
    ],
    totalAmount: 800.00,
    approvedAmount: 750.00,
    paidAmount: 750.00,
    status: 'paid',
    adjustmentReason: 'Consultation not covered'
  }
]

export default function InsuranceClaimsPage() {
  const [claims, setClaims] = useState(DUMMY_CLAIMS)
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredClaims = claims.filter(claim =>
    statusFilter === 'all' || claim.status === statusFilter
  )

  const summary = {
    total: claims.length,
    submitted: claims.filter(c => c.status === 'submitted').length,
    approved: claims.filter(c => c.status === 'approved').length,
    denied: claims.filter(c => c.status === 'denied').length,
    paid: claims.filter(c => c.status === 'paid').length,
    totalSubmitted: claims.reduce((sum, c) => sum + c.totalAmount, 0),
    totalApproved: claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
    totalPaid: claims.reduce((sum, c) => sum + (c.paidAmount || 0), 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Insurance Claims</h1>
          <p className="text-muted-foreground">Submit and track insurance claims for services</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/sleep-clinic/claims/submit'}>
          + Submit New Claim
        </Button>
      </div>

      {/* Claims Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Submitted</div>
          <div className="text-2xl font-bold">${summary.totalSubmitted.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">{summary.total} claims</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-2xl font-bold text-green-600">${summary.totalApproved.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">{summary.approved} claims</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-2xl font-bold text-blue-600">${summary.totalPaid.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">{summary.paid} claims</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Denied</div>
          <div className="text-2xl font-bold text-red-600">{summary.denied}</div>
          <div className="text-xs text-muted-foreground mt-1">Require attention</div>
        </Card>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {['all', 'submitted', 'approved', 'denied', 'paid'].map(status => (
          <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map(claim => (
          <Card key={claim.id} className={`p-6 ${claim.status === 'denied' ? 'border-red-500' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Claim #{claim.claimNumber}</h3>
                <div className="text-sm text-muted-foreground">
                  Patient: {claim.patient.name} • Invoice: {claim.invoiceNumber}
                </div>
              </div>
              <Badge variant={
                claim.status === 'paid' ? 'default' :
                claim.status === 'approved' ? 'default' :
                claim.status === 'submitted' ? 'secondary' : 'destructive'
              }>
                {claim.status}
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-4">
              <div>
                <div className="text-sm font-semibold mb-2">Insurance Provider</div>
                <div className="text-sm">{claim.insurance.provider}</div>
                <div className="text-xs text-muted-foreground">Policy: {claim.patient.policyNumber}</div>
                <div className="text-xs text-muted-foreground">Group: {claim.insurance.groupNumber}</div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Timeline</div>
                <div className="text-sm space-y-1">
                  <div>Submitted: {claim.submittedDate}</div>
                  {claim.approvedDate && <div className="text-green-600">Approved: {claim.approvedDate}</div>}
                  {claim.deniedDate && <div className="text-red-600">Denied: {claim.deniedDate}</div>}
                  {claim.paidDate && <div className="text-blue-600">Paid: {claim.paidDate}</div>}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Amounts</div>
                <div className="text-sm space-y-1">
                  <div>Submitted: ${claim.totalAmount.toFixed(2)}</div>
                  {claim.approvedAmount && <div>Approved: ${claim.approvedAmount.toFixed(2)}</div>}
                  {claim.paidAmount && <div className="text-green-600">Paid: ${claim.paidAmount.toFixed(2)}</div>}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">Services Claimed</div>
              <div className="space-y-1">
                {claim.services.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{service.code}</span> - {service.description}
                    </div>
                    <div className="font-semibold">${service.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {claim.denialReason && (
              <div className="mb-4 p-3 bg-red-50 rounded">
                <div className="text-sm font-semibold text-red-900">Denial Reason</div>
                <div className="text-sm text-red-700">{claim.denialReason}</div>
                {claim.appealDeadline && (
                  <div className="text-xs text-red-600 mt-1">
                    Appeal by: {claim.appealDeadline}
                  </div>
                )}
              </div>
            )}

            {claim.adjustmentReason && (
              <div className="mb-4 p-3 bg-yellow-50 rounded text-sm">
                <span className="font-semibold">Adjustment:</span> {claim.adjustmentReason}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/sleep-clinic/claims/${claim.id}`}>
                View Details
              </Button>
              {claim.status === 'denied' && (
                <Button size="sm" onClick={() => alert('File appeal')}>
                  File Appeal
                </Button>
              )}
              {claim.status === 'submitted' && (
                <Button size="sm" variant="outline" onClick={() => alert('Check status')}>
                  Check Status
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => alert('Download claim form')}>
                Download Form
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
