/**
 * Clinician Dashboard
 * Personalized dashboard for clinical staff with tasks, schedule, and metrics
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dummy data for logged-in clinician
const DUMMY_CLINICIAN_DATA = {
  user: {
    id: 'staff-001',
    name: 'Dr. Sarah Anderson',
    role: 'physician',
    avatar: '👩‍⚕️'
  },
  todaySchedule: [
    { id: '1', time: '09:00', patient: 'John Smith', type: 'Consultation', duration: 30, status: 'completed' },
    { id: '2', time: '09:45', patient: 'Mary Johnson', type: 'Follow-up', duration: 15, status: 'completed' },
    { id: '3', time: '10:15', patient: 'Bob Wilson', type: 'CPAP Training', duration: 60, status: 'in_progress' },
    { id: '4', time: '11:30', patient: 'Sarah Davis', type: 'Sleep Study Review', duration: 30, status: 'upcoming' },
    { id: '5', time: '13:00', patient: 'Mike Brown', type: 'Initial Consultation', duration: 45, status: 'upcoming' },
    { id: '6', time: '14:00', patient: 'Linda Martinez', type: 'PFT Interpretation', duration: 30, status: 'upcoming' }
  ],
  tasks: [
    { id: 't1', type: 'interpretation', priority: 'urgent', title: 'Review HSAT results for Linda Martinez', dueDate: 'Today', description: 'Severe OSA indicated (AHI: 45.2)', action: '/dashboard/sleep-clinic/interpretations/INTERP-003' },
    { id: 't2', type: 'follow_up', priority: 'high', title: 'Schedule follow-up for John Smith post-CPAP', dueDate: 'Today', description: 'CPAP setup completed yesterday, schedule 1-week check-in', action: '/dashboard/scheduling/new' },
    { id: 't3', type: 'prescription', priority: 'high', title: 'Approve DME prescription for Sarah Davis', dueDate: 'Today', description: 'CPAP machine and supplies', action: '/dashboard/prescriptions/pending' },
    { id: 't4', type: 'documentation', priority: 'medium', title: 'Complete encounter notes for morning appointments', dueDate: 'Today', description: '2 encounters pending documentation', action: '/dashboard/encounters/pending' },
    { id: 't5', type: 'referral', priority: 'medium', title: 'Review new referral from Dr. Chen', dueDate: 'Tomorrow', description: 'Patient with suspected OSA - moderate urgency', action: '/dashboard/sleep-clinic/referrals/REF-004' }
  ],
  metrics: {
    today: {
      appointmentsScheduled: 6,
      appointmentsCompleted: 2,
      utilizationPercentage: 85,
      revenueGenerated: 450.00
    },
    week: {
      appointmentsCompleted: 18,
      utilizationRate: 82.4,
      patientSatisfaction: 4.8,
      revenueGenerated: 4250.00
    }
  },
  pendingResults: [
    { id: 'r1', patient: 'Sarah Davis', test: 'HSAT', completedDate: '2026-01-20', ahi: 28.5, severity: 'moderate' },
    { id: 'r2', patient: 'Mike Brown', test: 'PFT', completedDate: '2026-01-19', fev1: 72, severity: 'mild' }
  ],
  alerts: [
    { type: 'urgent', message: '1 interpretation over 48 hours old', count: 1 },
    { type: 'info', message: '3 follow-ups due this week', count: 3 },
    { type: 'success', message: '100% on-time appointment start today', count: 0 }
  ]
}

export default function ClinicianDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { user, todaySchedule, tasks, metrics, pendingResults, alerts } = DUMMY_CLINICIAN_DATA

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name} {user.avatar}</h1>
          <p className="text-muted-foreground">Here's your dashboard for today</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
          <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, idx) => (
          <Card key={idx} className={`p-4 ${
            alert.type === 'urgent' ? 'bg-red-50 border-red-500 border-2' :
            alert.type === 'info' ? 'bg-blue-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {alert.type === 'urgent' ? '🔴' : alert.type === 'info' ? 'ℹ️' : '✅'}
              </span>
              <div className="flex-1">
                <div className="font-semibold">{alert.message}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Today's Appointments</div>
          <div className="text-3xl font-bold">
            {metrics.today.appointmentsCompleted}/{metrics.today.appointmentsScheduled}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {Math.round((metrics.today.appointmentsCompleted / metrics.today.appointmentsScheduled) * 100)}% complete
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Today's Utilization</div>
          <div className="text-3xl font-bold text-green-600">{metrics.today.utilizationPercentage}%</div>
          <div className="text-xs text-muted-foreground mt-1">Target: 85%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Revenue Today</div>
          <div className="text-3xl font-bold">${metrics.today.revenueGenerated}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
          <div className="text-3xl font-bold text-yellow-500">{metrics.week.patientSatisfaction}/5.0</div>
          <div className="text-xs text-muted-foreground mt-1">This week</div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="results">Pending Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Next Appointment */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">⏰ Next Appointment</h3>
              {todaySchedule.filter(apt => apt.status === 'upcoming')[0] ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{todaySchedule.filter(apt => apt.status === 'upcoming')[0].time}</div>
                  <div className="text-lg">{todaySchedule.filter(apt => apt.status === 'upcoming')[0].patient}</div>
                  <div className="text-sm text-muted-foreground">{todaySchedule.filter(apt => apt.status === 'upcoming')[0].type} • {todaySchedule.filter(apt => apt.status === 'upcoming')[0].duration} min</div>
                  <Button size="sm" onClick={() => alert('View patient chart')}>
                    View Chart
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground">No upcoming appointments</div>
              )}
            </Card>

            {/* Urgent Tasks */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">🔥 Urgent Tasks</h3>
              <div className="space-y-2">
                {tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 3).map(task => (
                  <div 
                    key={task.id}
                    className="p-3 bg-red-50 rounded cursor-pointer hover:bg-red-100"
                    onClick={() => window.location.href = task.action}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{task.description}</div>
                      </div>
                      <Badge variant="destructive">{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">📅 Today's Schedule ({new Date().toLocaleDateString()})</h3>
            <div className="space-y-3">
              {todaySchedule.map(apt => (
                <div 
                  key={apt.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    apt.status === 'completed' ? 'bg-green-50 border-green-500' :
                    apt.status === 'in_progress' ? 'bg-blue-50 border-blue-500' :
                    'bg-gray-50 border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold">{apt.time}</div>
                      <div>
                        <div className="font-semibold">{apt.patient}</div>
                        <div className="text-sm text-muted-foreground">{apt.type} • {apt.duration} min</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        apt.status === 'completed' ? 'default' :
                        apt.status === 'in_progress' ? 'default' : 'secondary'
                      }>
                        {apt.status}
                      </Badge>
                      {apt.status === 'upcoming' && (
                        <Button size="sm" onClick={() => alert('Check in patient')}>
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">✓ My Tasks ({tasks.length})</h3>
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    task.priority === 'urgent' ? 'bg-red-50 border-red-500 border' :
                    task.priority === 'high' ? 'bg-yellow-50 border-yellow-500 border' :
                    'bg-blue-50'
                  }`}
                  onClick={() => window.location.href = task.action}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'default' : 'secondary'
                        }>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.type}</Badge>
                        <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                      </div>
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      Complete →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">📋 Pending Results Requiring Attention</h3>
            <div className="space-y-3">
              {pendingResults.map(result => (
                <div key={result.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{result.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.test} • Completed: {result.completedDate}
                      </div>
                      <div className="text-sm font-medium mt-2">
                        {result.test === 'HSAT' && (
                          <span>AHI: {result.ahi} - <Badge variant={result.severity === 'moderate' ? 'default' : 'secondary'}>{result.severity} OSA</Badge></span>
                        )}
                        {result.test === 'PFT' && (
                          <span>FEV1: {result.fev1}% - <Badge variant="secondary">{result.severity} obstruction</Badge></span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => window.location.href = '/dashboard/sleep-clinic/interpretations'}>
                      Review →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/patients/new'}>
            + New Patient
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/scheduling/new'}>
            + Book Appointment
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/prescriptions/new'}>
            + New Prescription
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals/new'}>
            + New Referral
          </Button>
        </div>
      </Card>
    </div>
  )
}
