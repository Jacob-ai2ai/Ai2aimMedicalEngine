/**
 * Scheduling & Calendar Management Page
 * Full calendar view with AI-powered recommendations and productivity mapping
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AICalendarAssistant } from '@/components/scheduling/ai-calendar-assistant'

export default function SchedulingPage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [capacity, setCapacity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
  }, [view, currentDate])

  async function loadCalendarData() {
    try {
      setLoading(true)
      const dateStr = currentDate.toISOString().split('T')[0]
      const response = await fetch(`/api/calendar?view=${view}&date=${dateStr}`)
      const result = await response.json()
      
      if (result.success) {
        setAppointments(result.data.appointments || [])
        setCapacity(result.data.capacity || [])
      }
    } catch (error) {
      console.error('Error loading calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  function navigateDate(direction: 'prev' | 'next') {
    const newDate = new Date(currentDate)
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }
    setCurrentDate(newDate)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Calendar</h1>
          <p className="text-muted-foreground">Manage staff schedules and appointments</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/scheduling/new'}>
          + New Appointment
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => navigateDate('prev')} variant="outline">
              ← Previous
            </Button>
            <Button onClick={() => setCurrentDate(new Date())} variant="outline">
              Today
            </Button>
            <Button onClick={() => navigateDate('next')} variant="outline">
              Next →
            </Button>
          </div>

          <div className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric',
              ...(view === 'day' ? { day: 'numeric' } : {})
            })}
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Appointments</div>
          <div className="text-2xl font-bold">{appointments.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Average Utilization</div>
          <div className="text-2xl font-bold">
            {capacity.length > 0 
              ? Math.round(capacity.reduce((sum: number, c: any) => sum + Number(c.utilization_percentage || 0), 0) / capacity.length)
              : 0}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Staff on Duty</div>
          <div className="text-2xl font-bold">
            {new Set(appointments.map((a: any) => a.staff_id)).size}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Available Slots</div>
          <div className="text-2xl font-bold">
            {capacity.reduce((sum: number, c: any) => 
              sum + Math.floor((c.total_available_minutes - c.booked_minutes) / 30), 0
            )}
          </div>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">Loading calendar...</div>
        ) : (
          <div className="space-y-4">
            {view === 'week' && (
              <WeekView appointments={appointments} capacity={capacity} />
            )}
            {view === 'day' && (
              <DayView appointments={appointments} capacity={capacity} />
            )}
            {view === 'month' && (
              <MonthView appointments={appointments} capacity={capacity} />
            )}
          </div>
        )}
      </Card>

      {/* AI Calendar Assistant with Recommendations and Productivity Heatmap */}
      <AICalendarAssistant
        currentDate={currentDate}
        capacity={capacity}
        appointments={appointments}
      />
    </div>
  )
}

function WeekView({ appointments, capacity }: any) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 bg-muted">Time</th>
            {days.map(day => (
              <th key={day} className="border p-2 bg-muted">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td className="border p-2 font-medium">{hour}:00</td>
              {days.map(day => (
                <td key={day} className="border p-2 min-h-[60px] align-top">
                  {appointments
                    .filter((apt: any) => {
                      const aptHour = parseInt(apt.start_time.split(':')[0])
                      return aptHour === hour
                    })
                    .map((apt: any) => (
                      <div 
                        key={apt.id}
                        className="text-xs p-1 mb-1 rounded bg-blue-100 hover:bg-blue-200 cursor-pointer"
                        onClick={() => window.location.href = `/dashboard/appointments/${apt.id}`}
                      >
                        <div className="font-semibold">{apt.patients?.first_name} {apt.patients?.last_name}</div>
                        <div>{apt.appointment_types?.name}</div>
                        <div>{apt.start_time} - {apt.end_time}</div>
                      </div>
                    ))
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DayView({ appointments, capacity }: any) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  return (
    <div className="space-y-2">
      {hours.map(hour => (
        <div key={hour} className="flex gap-4 border-b pb-2">
          <div className="w-20 font-medium">{hour}:00</div>
          <div className="flex-1 space-y-1">
            {appointments
              .filter((apt: any) => parseInt(apt.start_time.split(':')[0]) === hour)
              .map((apt: any) => (
                <Card 
                  key={apt.id}
                  className="p-3 hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => window.location.href = `/dashboard/appointments/${apt.id}`}
                >
                  <div className="font-semibold">
                    {apt.patients?.first_name} {apt.patients?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {apt.appointment_types?.name} • {apt.user_profiles?.full_name}
                  </div>
                  <div className="text-xs">
                    {apt.start_time} - {apt.end_time} ({apt.duration_minutes} min)
                  </div>
                </Card>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  )
}

function MonthView({ appointments, capacity }: any) {
  const [currentMonthDate] = useState(new Date())
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const days = getDaysInMonth(currentMonthDate)

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 font-semibold text-center bg-muted">
          {day}
        </div>
      ))}
      {days.map(day => {
        const dayAppts = appointments.filter((apt: any) => 
          apt.appointment_date === day.toISOString().split('T')[0]
        )
        return (
          <Card key={day.toISOString()} className="p-2 min-h-[100px]">
            <div className="font-semibold">{day.getDate()}</div>
            <div className="text-xs space-y-1 mt-1">
              {dayAppts.slice(0, 3).map((apt: any) => (
                <div 
                  key={apt.id}
                  className="bg-blue-100 p-1 rounded cursor-pointer hover:bg-blue-200"
                  onClick={() => window.location.href = `/dashboard/appointments/${apt.id}`}
                >
                  {apt.start_time.slice(0, 5)}
                </div>
              ))}
              {dayAppts.length > 3 && (
                <div className="text-muted-foreground">+{dayAppts.length - 3} more</div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
