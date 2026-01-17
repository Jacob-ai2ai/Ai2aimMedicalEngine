/**
 * Sleep Clinic Referrals Management
 * Track and manage physician referrals for sleep studies
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dummy referral data
const DUMMY_REFERRALS = [
  {
    id: 'REF-001',
    patient: { name: 'John Smith', dob: '1975-03-15', phone: '780-555-0101', mrn: 'MRN-12345' },
    physician: { name: 'Dr. Sarah Anderson', clinic: 'Edmonton Family Medicine', phone: '780-555-0200' },
    date: '2026-01-15',
    reason: 'Suspected OSA - loud snoring, daytime fatigue',
    urgency: 'high',
    status: 'pending',
    requestedTests: ['HSAT', 'Consultation'],
    insurance: { provider: 'Alberta Blue Cross', policyNumber: 'ABC-789456', verified: true }
  },
  {
    id: 'REF-002',
    patient: { name: 'Mary Johnson', dob: '1982-07-22', phone: '780-555-0102', mrn: 'MRN-12346' },
    physician: { name: 'Dr. Michael Lee', clinic: 'Calgary Medical Center', phone: '403-555-0300' },
    date: '2026-01-14',
    reason: 'Follow-up PFT - COPD monitoring',
    urgency: 'normal',
    status: 'scheduled',
    requestedTests: ['PFT'],
    scheduledDate: '2026-01-22',
    insurance: { provider: 'Manulife', policyNumber: 'MAN-456123', verified: true }
  },
  {
    id: 'REF-003',
    patient: { name: 'Robert Wilson', dob: '1968-11-30', phone: '780-555-0103', mrn: 'MRN-12347' },
    physician: { name: 'Dr. Jennifer Chen', clinic: 'Respirology Associates', phone: '780-555-0400' },
    date: '2026-01-13',
    reason: 'CPAP titration study',
    urgency: 'normal',
    status: 'completed',
    requestedTests: ['Titration Study'],
    completedDate: '2026-01-20',
    insurance: { provider: 'Sunlife', policyNumber: 'SUN-789012', verified: false }
  },
  {
    id: 'REF-004',
    patient: { name: 'Lisa Brown', dob: '1990-05-18', phone: '780-555-0104', mrn: 'MRN-12348' },
    physician: { name: 'Dr. David Kumar', clinic: 'Sleep Disorders Clinic', phone: '780-555-0500' },
    date: '2026-01-12',
    reason: 'Insomnia assessment',
    urgency: 'low',
    status: 'cancelled',
    requestedTests: ['Consultation'],
    insurance: { provider: 'Canada Life', policyNumber: 'CAN-345678', verified: true }
  }
]

export default function SleepClinicReferralsPage() {
  const [referrals, setReferrals] = useState(DUMMY_REFERRALS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch = !search || 
      ref.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      ref.physician.name.toLowerCase().includes(search.toLowerCase()) ||
      ref.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ref.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    scheduled: referrals.filter(r => r.status === 'scheduled').length,
    completed: referrals.filter(r => r.status === 'completed').length,
    cancelled: referrals.filter(r => r.status === 'cancelled').length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sleep Clinic Referrals</h1>
          <p className="text-muted-foreground">Manage physician referrals and track patient journey</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals/new'}>
          + New Referral
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={`p-4 cursor-pointer transition-shadow ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`} onClick={() => setStatusFilter('all')}>
          <div className="text-sm text-muted-foreground">All Referrals</div>
          <div className="text-2xl font-bold">{statusCounts.all}</div>
        </Card>
        <Card className={`p-4 cursor-pointer transition-shadow ${statusFilter === 'pending' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`} onClick={() => setStatusFilter('pending')}>
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
        </Card>
        <Card className={`p-4 cursor-pointer transition-shadow ${statusFilter === 'scheduled' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`} onClick={() => setStatusFilter('scheduled')}>
          <div className="text-sm text-muted-foreground">Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
        </Card>
        <Card className={`p-4 cursor-pointer transition-shadow ${statusFilter === 'completed' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`} onClick={() => setStatusFilter('completed')}>
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
        </Card>
        <Card className={`p-4 cursor-pointer transition-shadow ${statusFilter === 'cancelled' ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`} onClick={() => setStatusFilter('cancelled')}>
          <div className="text-sm text-muted-foreground">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled}</div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search by patient name, physician, or referral ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Referrals List */}
      <div className="space-y-4">
        {filteredReferrals.map(ref => (
          <Card key={ref.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{ref.patient.name}</h3>
                  <Badge variant={ref.urgency === 'high' ? 'destructive' : 'secondary'}>
                    {ref.urgency} priority
                  </Badge>
                  <Badge variant={
                    ref.status === 'pending' ? 'default' :
                    ref.status === 'scheduled' ? 'default' :
                    ref.status === 'completed' ? 'secondary' : 'destructive'
                  }>
                    {ref.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Referral ID: {ref.id} • MRN: {ref.patient.mrn} • DOB: {ref.patient.dob}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Received: {ref.date}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold mb-2">Referring Physician</div>
                <div className="text-sm">{ref.physician.name}</div>
                <div className="text-xs text-muted-foreground">{ref.physician.clinic}</div>
                <div className="text-xs text-muted-foreground">{ref.physician.phone}</div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Insurance</div>
                <div className="text-sm">{ref.insurance.provider}</div>
                <div className="text-xs text-muted-foreground">Policy: {ref.insurance.policyNumber}</div>
                <Badge variant={ref.insurance.verified ? 'default' : 'destructive'} className="mt-1">
                  {ref.insurance.verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">Reason for Referral</div>
              <p className="text-sm">{ref.reason}</p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">Requested Tests</div>
              <div className="flex gap-2">
                {ref.requestedTests.map(test => (
                  <Badge key={test} variant="outline">{test}</Badge>
                ))}
              </div>
            </div>

            {ref.scheduledDate && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <div className="text-sm font-semibold text-blue-900">
                  Scheduled for: {ref.scheduledDate}
                </div>
              </div>
            )}

            {ref.completedDate && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <div className="text-sm font-semibold text-green-900">
                  Completed on: {ref.completedDate}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/dashboard/sleep-clinic/referrals/${ref.id}`}
              >
                View Details
              </Button>
              {ref.status === 'pending' && (
                <>
                  <Button 
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/sleep-clinic/referrals/${ref.id}/schedule`}
                  >
                    Schedule Tests
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => alert('Verify insurance functionality')}
                  >
                    Verify Insurance
                  </Button>
                </>
              )}
              {ref.status === 'scheduled' && (
                <Button 
                  size="sm"
                  onClick={() => alert('Complete referral functionality')}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredReferrals.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No referrals found</p>
        </Card>
      )}
    </div>
  )
}
