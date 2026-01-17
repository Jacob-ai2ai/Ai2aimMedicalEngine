/**
 * Productivity Reports Page
 * View clinic-wide and individual staff productivity metrics
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProductivityReportsPage() {
  const [clinicMetrics, setClinicMetrics] = useState<any>(null)
  const [underutilized, setUnderutilized] = useState<any[]>([])
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProductivityData()
  }, [startDate, endDate])

  async function loadProductivityData() {
    try {
      setLoading(true)
      
      // Load clinic-wide metrics
      const clinicRes = await fetch(`/api/productivity/clinic?startDate=${startDate}&endDate=${endDate}`)
      if (clinicRes.ok) {
        const data = await clinicRes.json()
        setClinicMetrics(data.data)
      }

      // Load underutilized staff
      const underutilRes = await fetch('/api/productivity/underutilized')
      if (underutilRes.ok) {
        const data = await underutilRes.json()
        setUnderutilized(data.data || [])
      }

    } catch (error) {
      console.error('Error loading productivity data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function downloadReport() {
    try {
      const response = await fetch(`/api/productivity/report?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `productivity-report-${startDate}-to-${endDate}.json`
      a.click()
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productivity Reports</h1>
          <p className="text-muted-foreground">Clinic-wide and individual staff productivity metrics</p>
        </div>
        <Button onClick={downloadReport}>Download Report</Button>
      </div>

      {/* Date Range Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">From:</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">To:</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={loadProductivityData}>Refresh</Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">Loading productivity data...</div>
      ) : (
        <>
          {/* Clinic Overview */}
          {clinicMetrics && (
            <>
              <h2 className="text-2xl font-semibold">Clinic Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Average Utilization</div>
                  <div className="text-2xl font-bold">
                    {clinicMetrics.clinicUtilizationRate?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {clinicMetrics.trendingUp ? '📈 Trending up' : '📉 Trending down'}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Total Appointments</div>
                  <div className="text-2xl font-bold">{clinicMetrics.appointmentsBooked}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Capacity: {clinicMetrics.totalCapacity} slots
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-2xl font-bold">
                    ${clinicMetrics.totalRevenueActual?.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expected: ${clinicMetrics.totalRevenueExpected?.toFixed(2)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Active Staff</div>
                  <div className="text-2xl font-bold">{clinicMetrics.topPerformers?.length || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    WoW Growth: {clinicMetrics.weekOverWeekGrowth?.toFixed(1)}%
                  </div>
                </Card>
              </div>

              {/* Top Performers */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Top Performers</h3>
                <div className="grid gap-4">
                  {clinicMetrics.topPerformers?.slice(0, 5).map((staff: any, index: number) => (
                    <Card key={staff.staffId} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                          <div>
                            <div className="font-semibold">{staff.staffName}</div>
                            <div className="text-sm text-muted-foreground">{staff.role}</div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-lg font-bold">{staff.utilizationRate?.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">
                            {staff.appointmentsCompleted} appointments
                          </div>
                          <div className="text-sm font-medium">
                            ${staff.revenueActual?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Underutilized Staff */}
          {underutilized.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">⚠️ Underutilized Staff (Below 75%)</h3>
              <div className="grid gap-4">
                {underutilized.map((staff: any) => (
                  <Card key={staff.staff_id} className="p-4 border-yellow-500 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{staff.staff_name}</div>
                        <div className="text-sm text-muted-foreground">{staff.role}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-bold text-yellow-700">
                          {Number(staff.utilization_percentage).toFixed(1)}%
                        </div>
                        <div className="text-sm">
                          {Math.floor(staff.available_minutes / 30)} open slots
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ${Number(staff.revenue_potential).toFixed(2)} potential
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => window.location.href = `/dashboard/staff/${staff.staff_id}`}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
