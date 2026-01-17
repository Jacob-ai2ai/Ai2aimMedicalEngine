/**
 * HSAT (Home Sleep Apnea Test) Management
 * Track device dispatch, returns, and study completion
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const DUMMY_HSATS = [
  {
    id: 'HSAT-001',
    patient: { name: 'John Smith', mrn: 'MRN-12345', phone: '780-555-0101' },
    device: { type: 'ApneaLink Air', serialNumber: 'AL-2024-1234', condition: 'excellent' },
    dispatchDate: '2026-01-16',
    expectedReturnDate: '2026-01-23',
    actualReturnDate: null,
    status: 'out',
    technicianNotes: 'Patient trained on device use. Provided instruction manual.',
    studyDuration: '3 nights required',
    results: null
  },
  {
    id: 'HSAT-002',
    patient: { name: 'Sarah Davis', mrn: 'MRN-12348', phone: '780-555-0104' },
    device: { type: 'WatchPAT ONE', serialNumber: 'WP-2024-5678', condition: 'good' },
    dispatchDate: '2026-01-15',
    expectedReturnDate: '2026-01-22',
    actualReturnDate: '2026-01-20',
    status: 'returned',
    technicianNotes: 'Device returned in good condition. Data downloaded successfully.',
    studyDuration: '2 nights completed',
    results: {
      ahi: 28.5,
      oxygenSaturation: 89,
      totalRecordingTime: '14.5 hours',
      status: 'pending_interpretation'
    }
  },
  {
    id: 'HSAT-003',
    patient: { name: 'Michael Chen', mrn: 'MRN-12351', phone: '780-555-0107' },
    device: { type: 'ApneaLink Air', serialNumber: 'AL-2024-5679', condition: 'excellent' },
    dispatchDate: '2026-01-12',
    expectedReturnDate: '2026-01-19',
    actualReturnDate: '2026-01-18',
    status: 'completed',
    technicianNotes: 'Study completed successfully. Results sent to sleep physician.',
    studyDuration: '3 nights completed',
    results: {
      ahi: 15.2,
      oxygenSaturation: 94,
      totalRecordingTime: '21 hours',
      status: 'interpreted',
      interpretation: {
        physician: 'Dr. Sleep Specialist',
        diagnosis: 'Mild OSA',
        recommendation: 'CPAP therapy recommended',
        date: '2026-01-19'
      }
    }
  }
]

export default function HSATManagementPage() {
  const [hsats, setHsats] = useState(DUMMY_HSATS)
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredHSATs = hsats.filter(hsat => 
    statusFilter === 'all' || hsat.status === statusFilter
  )

  const statusCounts = {
    all: hsats.length,
    out: hsats.filter(h => h.status === 'out').length,
    returned: hsats.filter(h => h.status === 'returned').length,
    completed: hsats.filter(h => h.status === 'completed').length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Home Sleep Studies (HSAT)</h1>
          <p className="text-muted-foreground">Manage device dispatch, tracking, and study completion</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/sleep-clinic/hsats/dispatch'}>
          + Dispatch Device
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`p-4 cursor-pointer ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter('all')}>
          <div className="text-sm text-muted-foreground">All Studies</div>
          <div className="text-2xl font-bold">{statusCounts.all}</div>
        </Card>
        <Card className={`p-4 cursor-pointer ${statusFilter === 'out' ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter('out')}>
          <div className="text-sm text-muted-foreground">Devices Out</div>
          <div className="text-2xl font-bold text-blue-600">{statusCounts.out}</div>
        </Card>
        <Card className={`p-4 cursor-pointer ${statusFilter === 'returned' ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter('returned')}>
          <div className="text-sm text-muted-foreground">Returned</div>
          <div className="text-2xl font-bold text-yellow-600">{statusCounts.returned}</div>
        </Card>
        <Card className={`p-4 cursor-pointer ${statusFilter === 'completed' ? 'ring-2 ring-primary' : ''}`} onClick={() => setStatusFilter('completed')}>
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
        </Card>
      </div>

      {/* HSAT List */}
      <div className="space-y-4">
        {filteredHSATs.map(hsat => (
          <Card key={hsat.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{hsat.patient.name}</h3>
                <div className="text-sm text-muted-foreground">
                  Study ID: {hsat.id} • MRN: {hsat.patient.mrn}
                </div>
              </div>
              <Badge variant={
                hsat.status === 'out' ? 'default' :
                hsat.status === 'returned' ? 'secondary' : 'default'
              }>
                {hsat.status}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm font-semibold mb-2">Device Information</div>
                <div className="text-sm space-y-1">
                  <div>Type: {hsat.device.type}</div>
                  <div>Serial: {hsat.device.serialNumber}</div>
                  <div>Condition: {hsat.device.condition}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Timeline</div>
                <div className="text-sm space-y-1">
                  <div>Dispatched: {hsat.dispatchDate}</div>
                  <div>Expected Return: {hsat.expectedReturnDate}</div>
                  {hsat.actualReturnDate && <div className="text-green-600">Returned: {hsat.actualReturnDate}</div>}
                  <div>Duration: {hsat.studyDuration}</div>
                </div>
              </div>
            </div>

            {hsat.results && (
              <div className="mb-4 p-4 bg-blue-50 rounded">
                <div className="text-sm font-semibold mb-2">Study Results</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">AHI</div>
                    <div className="text-lg font-bold">{hsat.results.ahi}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Oxygen Sat.</div>
                    <div className="text-lg font-bold">{hsat.results.oxygenSaturation}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Recording Time</div>
                    <div className="text-lg font-bold">{hsat.results.totalRecordingTime}</div>
                  </div>
                </div>
                {hsat.results.interpretation && (
                  <div className="mt-3 p-3 bg-white rounded text-sm">
                    <div className="font-semibold">Interpretation: {hsat.results.interpretation.diagnosis}</div>
                    <div className="text-muted-foreground">By {hsat.results.interpretation.physician} on {hsat.results.interpretation.date}</div>
                    <div className="mt-1">Recommendation: {hsat.results.interpretation.recommendation}</div>
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-muted-foreground mb-4">
              Notes: {hsat.technicianNotes}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/sleep-clinic/hsats/${hsat.id}`}>
                View Details
              </Button>
              {hsat.status === 'out' && (
                <Button size="sm" onClick={() => alert('Process return')}>
                  Process Return
                </Button>
              )}
              {hsat.status === 'returned' && !hsat.results?.interpretation && (
                <Button size="sm" onClick={() => window.location.href = `/dashboard/sleep-clinic/interpretations/create?hsatId=${hsat.id}`}>
                  Add Interpretation
                </Button>
              )}
              {hsat.results && (
                <Button size="sm" variant="outline" onClick={() => alert('Download report')}>
                  Download Report
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
