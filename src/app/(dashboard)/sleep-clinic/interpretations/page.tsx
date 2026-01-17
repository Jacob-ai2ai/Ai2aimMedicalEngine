/**
 * Sleep Study Interpretations
 * Pending interpretations from sleep physicians
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const DUMMY_INTERPRETATIONS = [
  {
    id: 'INTERP-001',
    patient: { name: 'Sarah Davis', mrn: 'MRN-12348', dob: '1985-06-12' },
    studyType: 'HSAT',
    studyId: 'HSAT-002',
    completedDate: '2026-01-20',
    results: {
      ahi: 28.5,
      oxygenSaturation: 89,
      totalRecordingTime: '14.5 hours',
      totalApneas: 142,
      totalHypopneas: 88,
      averageHeartRate: 68
    },
    status: 'pending',
    priority: 'high',
    assignedTo: null,
    urgencyNotes: 'Moderate-severe OSA indicated, needs urgent review'
  },
  {
    id: 'INTERP-002',
    patient: { name: 'Mike Brown', mrn: 'MRN-12349', dob: '1972-11-30' },
    studyType: 'PFT',
    studyId: 'PFT-015',
    completedDate: '2026-01-19',
    results: {
      fev1: 72,
      fvc: 85,
      fev1fvc: 68,
      dlco: 78,
      interpretation: 'Mild obstructive pattern'
    },
    status: 'pending',
    priority: 'normal',
    assignedTo: 'Dr. Respirology',
    urgencyNotes: null
  },
  {
    id: 'INTERP-003',
    patient: { name: 'Linda Martinez', mrn: 'MRN-12352', dob: '1990-03-25' },
    studyType: 'HSAT',
    studyId: 'HSAT-004',
    completedDate: '2026-01-18',
    results: {
      ahi: 45.2,
      oxygenSaturation: 82,
      totalRecordingTime: '18 hours',
      totalApneas: 285,
      totalHypopneas: 196,
      averageHeartRate: 75
    },
    status: 'in_review',
    priority: 'urgent',
    assignedTo: 'Dr. Sleep Specialist',
    urgencyNotes: 'Severe OSA with significant oxygen desaturation - URGENT',
    reviewStarted: '2026-01-20 10:30 AM'
  }
]

export default function InterpretationsPage() {
  const [interpretations, setInterpretations] = useState(DUMMY_INTERPRETATIONS)
  const [statusFilter, setStatusFilter] = useState('pending')

  const filteredInterps = interpretations.filter(interp => 
    statusFilter === 'all' || interp.status === statusFilter
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Interpretations</h1>
          <p className="text-muted-foreground">Pending sleep study and PFT interpretations</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/interpretations/queue'}>
          Interpretation Queue
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
          All
        </Button>
        <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>
          Pending
        </Button>
        <Button variant={statusFilter === 'in_review' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('in_review')}>
          In Review
        </Button>
      </div>

      {/* Interpretations List */}
      <div className="space-y-4">
        {filteredInterps.map(interp => (
          <Card key={interp.id} className={`p-6 ${interp.priority === 'urgent' ? 'border-red-500 border-2' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{interp.patient.name}</h3>
                <div className="text-sm text-muted-foreground">
                  {interp.studyType} • Study ID: {interp.studyId} • MRN: {interp.patient.mrn}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={interp.priority === 'urgent' ? 'destructive' : interp.priority === 'high' ? 'default' : 'secondary'}>
                  {interp.priority}
                </Badge>
                <Badge variant={interp.status === 'pending' ? 'default' : 'secondary'}>
                  {interp.status}
                </Badge>
              </div>
            </div>

            {interp.urgencyNotes && (
              <div className={`mb-4 p-3 rounded ${interp.priority === 'urgent' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <div className="text-sm font-semibold">⚠️ {interp.urgencyNotes}</div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm font-semibold mb-2">Study Details</div>
                <div className="text-sm space-y-1">
                  <div>Completed: {interp.completedDate}</div>
                  {interp.assignedTo && <div>Assigned to: {interp.assignedTo}</div>}
                  {interp.reviewStarted && <div className="text-blue-600">Review started: {interp.reviewStarted}</div>}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Key Results</div>
                <div className="text-sm space-y-1">
                  {interp.studyType === 'HSAT' && (
                    <>
                      <div>AHI: <span className="font-bold">{interp.results.ahi}</span></div>
                      <div>O2 Sat: <span className="font-bold">{interp.results.oxygenSaturation}%</span></div>
                      <div>Recording: {interp.results.totalRecordingTime}</div>
                    </>
                  )}
                  {interp.studyType === 'PFT' && (
                    <>
                      <div>FEV1: <span className="font-bold">{interp.results.fev1}%</span></div>
                      <div>FVC: <span className="font-bold">{interp.results.fvc}%</span></div>
                      <div>FEV1/FVC: <span className="font-bold">{interp.results.fev1fvc}%</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => window.location.href = `/dashboard/sleep-clinic/interpretations/${interp.id}/interpret`}>
                Start Interpretation
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/sleep-clinic/interpretations/${interp.id}`}>
                View Full Results
              </Button>
              <Button size="sm" variant="outline" onClick={() => alert('Download raw data')}>
                Download Data
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredInterps.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No pending interpretations</p>
        </Card>
      )}
    </div>
  )
}
