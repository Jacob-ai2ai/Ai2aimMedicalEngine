/**
 * Staff Detail Page
 * View and manage individual staff member details, schedule, and productivity
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function StaffDetailPage({ params }: { params: { id: string } }) {
  const [staff, setStaff] = useState<any>(null)
  const [schedule, setSchedule] = useState<any[]>([])
  const [capacity, setCapacity] = useState<any>(null)
  const [productivity, setProductivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaffData()
  }, [params.id])

  async function loadStaffData() {
    try {
      setLoading(true)
      
      // Load staff profile
      const staffRes = await fetch(`/api/users/${params.id}`)
      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData.data)
      }

      // Load schedule
      const scheduleRes = await fetch(`/api/staff/${params.id}/schedule`)
      if (scheduleRes.ok) {
        const schedData = await scheduleRes.json()
        setSchedule(schedData.data || [])
      }

      // Load capacity
      const capacityRes = await fetch(`/api/staff/${params.id}/capacity`)
      if (capacityRes.ok) {
        const capData = await capacityRes.json()
        setCapacity(capData.data)
      }

      // Load productivity
      const productivityRes = await fetch(`/api/productivity/staff/${params.id}`)
      if (productivityRes.ok) {
        const prodData = await productivityRes.json()
        setProductivity(prodData.data)
      }

    } catch (error) {
      console.error('Error loading staff data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!staff) {
    return <div className="p-6">Staff member not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{staff.full_name}</h1>
          <p className="text-muted-foreground">{staff.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{staff.role}</Badge>
            <Badge variant={staff.is_active ? 'default' : 'secondary'}>
              {staff.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back
          </Button>
          <Button onClick={() => window.location.href = `/dashboard/staff/${params.id}/edit`}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Utilization (7 days)</div>
          <div className="text-2xl font-bold">
            {productivity?.utilizationRate?.toFixed(1) || 0}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Appointments</div>
          <div className="text-2xl font-bold">
            {productivity?.appointmentsScheduled || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Revenue (7 days)</div>
          <div className="text-2xl font-bold">
            ${productivity?.revenueActual?.toFixed(2) || '0.00'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">No-Show Rate</div>
          <div className="text-2xl font-bold">
            {productivity?.noShowRate?.toFixed(1) || 0}%
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Weekly Schedule</h3>
            {schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((day: any) => (
                  <div key={day.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-4">
                      <div className="font-medium w-24 capitalize">{day.day_of_week}</div>
                      <div className="text-sm text-muted-foreground">
                        {day.start_time} - {day.end_time}
                      </div>
                      {day.break_start && (
                        <div className="text-xs text-muted-foreground">
                          Break: {day.break_start} - {day.break_end}
                        </div>
                      )}
                    </div>
                    <Badge variant={day.is_active ? 'default' : 'secondary'}>
                      {day.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No schedule configured</p>
            )}
            <Button className="mt-4" onClick={() => window.location.href = `/dashboard/staff/${params.id}/schedule/edit`}>
              Edit Schedule
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Productivity Metrics (Last 7 Days)</h3>
            {productivity ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Available Hours</div>
                  <div className="text-lg font-semibold">{productivity.totalAvailableHours?.toFixed(1)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Booked Hours</div>
                  <div className="text-lg font-semibold">{productivity.bookedHours?.toFixed(1)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Completed Hours</div>
                  <div className="text-lg font-semibold">{productivity.completedHours?.toFixed(1)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Utilization Rate</div>
                  <div className="text-lg font-semibold">{productivity.utilizationRate?.toFixed(1)}%</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Appointments Scheduled</div>
                  <div className="text-lg font-semibold">{productivity.appointmentsScheduled}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Appointments Completed</div>
                  <div className="text-lg font-semibold">{productivity.appointmentsCompleted}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                  <div className="text-lg font-semibold">{productivity.completionRate?.toFixed(1)}%</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Revenue Per Hour</div>
                  <div className="text-lg font-semibold">${productivity.revenuePerHour?.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No productivity data available</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Capacity Overview (Next 7 Days)</h3>
            {capacity && capacity.capacity ? (
              <div className="space-y-3">
                {capacity.capacity.map((day: any) => (
                  <div key={day.date} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {day.appointments_scheduled} appointments • {day.utilization_percentage?.toFixed(0)}% utilized
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${day.revenue_expected?.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">expected revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No capacity data available</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="timeoff" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Time Off Requests</h3>
              <Button onClick={() => window.location.href = `/dashboard/staff/${params.id}/time-off/new`}>
                Request Time Off
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Time off requests and approvals will be displayed here
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
