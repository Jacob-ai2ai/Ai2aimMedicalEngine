/**
 * Management Dashboard
 * Executive overview with KPIs, trends, and critical alerts
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Dummy executive KPI data
const DUMMY_EXEC_DATA = {
  financials: {
    monthlyRevenue: 125480.50,
    revenueGrowth: 12.5,
    arBalance: 45280.50,
    collectionRate: 92.3,
    avgDaysToPayment: 42
  },
  operations: {
    totalStaff: 12,
    avgUtilization: 82.4,
    totalPatients: 342,
    activePatients: 156,
    newPatientsThisMonth: 28
  },
  clinical: {
    appointmentsThisMonth: 486,
    completionRate: 94.2,
    noShowRate: 3.8,
    patientSatisfaction: 4.7
  },
  sleepClinic: {
    activeReferrals: 24,
    pendingInterpretations: 15,
    hsatsOut: 12,
    cpapSetupsThisMonth: 18
  },
  alerts: [
    { type: 'critical', message: '15 study interpretations pending over 48 hours', action: '/dashboard/sleep-clinic/interpretations' },
    { type: 'warning', message: '5 staff members below 75% utilization', action: '/dashboard/productivity/underutilized' },
    { type: 'info', message: '$45,280 in AR over 30 days', action: '/dashboard/sleep-clinic/ar' },
    { type: 'success', message: 'Revenue up 12.5% from last month', action: '/dashboard/reports/billing' }
  ]
}

export default function ManagementDashboardPage() {
  const [data, setData] = useState(DUMMY_EXEC_DATA)
  const [timeRange, setTimeRange] = useState('month')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <p className="text-muted-foreground">Executive overview and key performance indicators</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded px-3 py-2"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/reports'}>
            View All Reports
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-xl font-semibold mb-4">⚡ Critical Alerts & Actions</h2>
        <div className="space-y-3">
          {data.alerts.map((alert, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                alert.type === 'critical' ? 'bg-red-100 border-red-500 border' :
                alert.type === 'warning' ? 'bg-yellow-100 border-yellow-500 border' :
                alert.type === 'success' ? 'bg-green-100 border-green-500 border' :
                'bg-blue-100 border-blue-500 border'
              }`}
              onClick={() => window.location.href = alert.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {alert.type === 'critical' ? '🔴' :
                     alert.type === 'warning' ? '⚠️' :
                     alert.type === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <span className="font-medium">{alert.message}</span>
                </div>
                <span className="text-sm text-muted-foreground">View →</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial KPIs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">💰 Financial Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            <div className="text-2xl font-bold">${data.financials.monthlyRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">
              ↑ {data.financials.revenueGrowth}% vs last month
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">AR Balance</div>
            <div className="text-2xl font-bold text-yellow-600">${data.financials.arBalance.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg {data.financials.avgDaysToPayment} days to payment
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Collection Rate</div>
            <div className="text-2xl font-bold text-green-600">{data.financials.collectionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">Target: 95%</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active Patients</div>
            <div className="text-2xl font-bold">{data.operations.activePatients}</div>
            <div className="text-xs text-muted-foreground mt-1">of {data.operations.totalPatients} total</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">New Patients</div>
            <div className="text-2xl font-bold text-blue-600">{data.operations.newPatientsThisMonth}</div>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </Card>
        </div>
      </div>

      {/* Operational KPIs */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">⚙️ Operational Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Staff Utilization</div>
            <div className="text-2xl font-bold">{data.operations.avgUtilization}%</div>
            <div className="text-xs text-green-600 mt-1">Target: 85%</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Appointments</div>
            <div className="text-2xl font-bold">{data.clinical.appointmentsThisMonth}</div>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Completion Rate</div>
            <div className="text-2xl font-bold text-green-600">{data.clinical.completionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">No-show: {data.clinical.noShowRate}%</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
            <div className="text-2xl font-bold text-yellow-500">{data.clinical.patientSatisfaction}/5.0</div>
            <div className="text-xs text-muted-foreground mt-1">Based on surveys</div>
          </Card>
        </div>
      </div>

      {/* Sleep Clinic Metrics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">😴 Sleep Clinic Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 cursor-pointer hover:shadow-lg" onClick={() => window.location.href = '/dashboard/sleep-clinic/referrals'}>
            <div className="text-sm text-muted-foreground">Active Referrals</div>
            <div className="text-2xl font-bold">{data.sleepClinic.activeReferrals}</div>
            <div className="text-xs text-blue-600 mt-1">View →</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-lg" onClick={() => window.location.href = '/dashboard/sleep-clinic/interpretations'}>
            <div className="text-sm text-muted-foreground">Pending Interpretations</div>
            <div className="text-2xl font-bold text-yellow-600">{data.sleepClinic.pendingInterpretations}</div>
            <div className="text-xs text-yellow-600 mt-1">Review →</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-lg" onClick={() => window.location.href = '/dashboard/sleep-clinic/hsats'}>
            <div className="text-sm text-muted-foreground">HSATs Out</div>
            <div className="text-2xl font-bold">{data.sleepClinic.hsatsOut}</div>
            <div className="text-xs text-blue-600 mt-1">Track →</div>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-lg" onClick={() => window.location.href = '/dashboard/sleep-clinic'}>
            <div className="text-sm text-muted-foreground">CPAP Setups</div>
            <div className="text-2xl font-bold text-green-600">{data.sleepClinic.cpapSetupsThisMonth}</div>
            <div className="text-xs text-green-600 mt-1">This month</div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/scheduling'}>
            📅 View Calendar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/reports/productivity'}>
            📊 Productivity Report
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/ar'}>
            💵 AR Management
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/staff'}>
            👥 Staff Overview
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/patients'}>
            🏥 Patient List
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/claims'}>
            📄 Insurance Claims
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/inventory/manage'}>
            📦 Inventory
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/ai-agents'}>
            🤖 AI Agents
          </Button>
        </div>
      </Card>
    </div>
  )
}
