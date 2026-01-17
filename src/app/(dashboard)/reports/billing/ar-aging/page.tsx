/**
 * AR Aging Report
 * Detailed accounts receivable aging analysis with export
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReportBuilder } from '@/lib/reports/report-builder'
import { getReportTemplate } from '@/lib/reports/report-templates'

// Dummy AR aging data
const DUMMY_AR_AGING = [
  { patientName: 'John Smith', mrn: 'MRN-12345', current: 892.50, days30to60: 0, days60to90: 0, over90: 0, total: 892.50, lastPayment: '2026-01-10' },
  { patientName: 'Sarah Davis', mrn: 'MRN-12348', current: 1200.75, days30to60: 1250.00, days60to90: 0, over90: 0, total: 2450.75, lastPayment: '2025-12-15' },
  { patientName: 'Michael Brown', mrn: 'MRN-12349', current: 0, days30to60: 1750.00, days60to90: 1500.00, over90: 0, total: 3250.00, lastPayment: '2025-11-01' },
  { patientName: 'Patricia Wilson', mrn: 'MRN-12350', current: 0, days30to60: 0, days60to90: 2550.00, over90: 2340.00, total: 4890.00, lastPayment: '2025-09-30' },
  { patientName: 'David Lee', mrn: 'MRN-12353', current: 550.00, days30to60: 0, days60to90: 0, over90: 0, total: 550.00, lastPayment: '2026-01-15' }
]

export default function ARAgingReportPage() {
  const [reportData, setReportData] = useState(DUMMY_AR_AGING)
  const [loading, setLoading] = useState(false)

  const totals = {
    current: reportData.reduce((sum, row) => sum + row.current, 0),
    days30to60: reportData.reduce((sum, row) => sum + row.days30to60, 0),
    days60to90: reportData.reduce((sum, row) => sum + row.days60to90, 0),
    over90: reportData.reduce((sum, row) => sum + row.over90, 0),
    total: reportData.reduce((sum, row) => sum + row.total, 0)
  }

  function exportToCSV() {
    const reportConfig = getReportTemplate('arAging')
    if (!reportConfig) return

    const csv = ReportBuilder.exportToCSV(
      { rows: reportData, totalRows: reportData.length, generatedAt: new Date().toISOString() },
      reportConfig
    )
    ReportBuilder.downloadReport(csv, `ar-aging-report-${new Date().toISOString().split('T')[0]}`, 'csv')
  }

  function exportToJSON() {
    const reportConfig = getReportTemplate('arAging')
    if (!reportConfig) return

    const json = ReportBuilder.exportToJSON(
      { rows: reportData, totalRows: reportData.length, generatedAt: new Date().toISOString() },
      reportConfig
    )
    ReportBuilder.downloadReport(json, `ar-aging-report-${new Date().toISOString().split('T')[0]}`, 'json')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AR Aging Report</h1>
          <p className="text-muted-foreground">Accounts receivable aging analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToJSON}>
            Export JSON
          </Button>
          <Button onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total AR</div>
          <div className="text-2xl font-bold">${totals.total.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Current (0-30)</div>
          <div className="text-xl font-bold text-green-600">${totals.current.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">30-60 Days</div>
          <div className="text-xl font-bold text-yellow-600">${totals.days30to60.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">60-90 Days</div>
          <div className="text-xl font-bold text-orange-600">${totals.days60to90.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Over 90 Days</div>
          <div className="text-xl font-bold text-red-600">${totals.over90.toLocaleString()}</div>
        </Card>
      </div>

      {/* AR Aging Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">MRN</th>
                <th className="text-right p-3">Current</th>
                <th className="text-right p-3">30-60 Days</th>
                <th className="text-right p-3">60-90 Days</th>
                <th className="text-right p-3">Over 90</th>
                <th className="text-right p-3">Total AR</th>
                <th className="text-left p-3">Last Payment</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-muted">
                  <td className="p-3 font-medium">{row.patientName}</td>
                  <td className="p-3 text-muted-foreground">{row.mrn}</td>
                  <td className="text-right p-3 text-green-600">${row.current.toFixed(2)}</td>
                  <td className="text-right p-3 text-yellow-600">${row.days30to60.toFixed(2)}</td>
                  <td className="text-right p-3 text-orange-600">${row.days60to90.toFixed(2)}</td>
                  <td className="text-right p-3 text-red-600">${row.over90.toFixed(2)}</td>
                  <td className="text-right p-3 font-bold">${row.total.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{row.lastPayment}</td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-muted font-bold">
                <td className="p-3" colSpan={2}>TOTALS</td>
                <td className="text-right p-3 text-green-600">${totals.current.toFixed(2)}</td>
                <td className="text-right p-3 text-yellow-600">${totals.days30to60.toFixed(2)}</td>
                <td className="text-right p-3 text-orange-600">${totals.days60to90.toFixed(2)}</td>
                <td className="text-right p-3 text-red-600">${totals.over90.toFixed(2)}</td>
                <td className="text-right p-3">${totals.total.toFixed(2)}</td>
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Generated: {new Date().toLocaleString()} | Total Accounts: {reportData.length}
      </div>
    </div>
  )
}
