/**
 * Invoice Summary Report
 * Comprehensive invoice report with filtering and export
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ReportBuilder } from '@/lib/reports/report-builder'
import { getReportTemplate } from '@/lib/reports/report-templates'

const DUMMY_INVOICE_DATA = [
  { invoiceNumber: 'INV-2601-001', patientName: 'John Smith', date: '2026-01-15', amount: 892.50, status: 'unpaid', dueDate: '2026-02-15', services: 'HSAT, Consultation' },
  { invoiceNumber: 'INV-2601-002', patientName: 'Mary Johnson', date: '2026-01-14', amount: 1312.50, status: 'paid', dueDate: '2026-02-14', services: 'CPAP Setup, Rental' },
  { invoiceNumber: 'INV-2601-003', patientName: 'Robert Wilson', date: '2026-01-13', amount: 472.50, status: 'pending', dueDate: '2026-02-13', services: 'PFT, Report' },
  { invoiceNumber: 'INV-2601-004', patientName: 'Sarah Davis', date: '2026-01-12', amount: 1250.00, status: 'paid', dueDate: '2026-02-12', services: 'HSAT' },
  { invoiceNumber: 'INV-2601-005', patientName: 'Mike Brown', date: '2026-01-11', amount: 650.00, status: 'unpaid', dueDate: '2026-02-11', services: 'Sleep Study' },
  { invoiceNumber: 'INV-2512-045', patientName: 'Linda Martinez', date: '2025-12-20', amount: 1800.00, status: 'overdue', dueDate: '2026-01-20', services: 'CPAP + Supplies' },
  { invoiceNumber: 'INV-2512-038', patientName: 'David Lee', date: '2025-12-15', amount: 550.00, status: 'paid', dueDate: '2026-01-15', services: 'Follow-up' }
]

export default function InvoiceSummaryReportPage() {
  const [invoices, setInvoices] = useState(DUMMY_INVOICE_DATA)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('2025-12-01')
  const [endDate, setEndDate] = useState('2026-01-31')

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = !search || 
      inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const invDate = new Date(inv.date)
    const matchesDate = invDate >= new Date(startDate) && invDate <= new Date(endDate)
    return matchesSearch && matchesStatus && matchesDate
  })

  const summary = {
    total: filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    unpaid: filteredInvoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)
  }

  function exportReport() {
    const reportConfig = getReportTemplate('invoiceSummary')
    if (!reportConfig) return

    const csv = ReportBuilder.exportToCSV(
      { rows: filteredInvoices, totalRows: filteredInvoices.length, generatedAt: new Date().toISOString() },
      reportConfig
    )
    ReportBuilder.downloadReport(csv, `invoice-summary-${new Date().toISOString().split('T')[0]}`, 'csv')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Summary Report</h1>
          <p className="text-muted-foreground">Comprehensive invoice report with filtering</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            Export CSV
          </Button>
          <Button onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid md:grid-cols-5 gap-4">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <select className="border rounded px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <Button onClick={() => { setSearch(''); setStatusFilter('all') }}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Invoiced</div>
          <div className="text-2xl font-bold">${summary.total.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-xl font-bold text-green-600">${summary.paid.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Unpaid</div>
          <div className="text-xl font-bold text-red-600">${summary.unpaid.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-xl font-bold text-yellow-600">${summary.pending.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="text-xl font-bold text-orange-600">${summary.overdue.toFixed(2)}</div>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Invoice #</th>
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Services</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-center p-3">Status</th>
                <th className="text-left p-3">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr key={inv.invoiceNumber} className="border-b hover:bg-muted cursor-pointer" onClick={() => window.location.href = `/dashboard/sleep-clinic/invoices/${inv.invoiceNumber}`}>
                  <td className="p-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="p-3">{inv.patientName}</td>
                  <td className="p-3 text-muted-foreground">{inv.date}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.services}</td>
                  <td className="text-right p-3 font-semibold">${inv.amount.toFixed(2)}</td>
                  <td className="text-center p-3">
                    <Badge variant={
                      inv.status === 'paid' ? 'default' :
                      inv.status === 'unpaid' ? 'destructive' :
                      inv.status === 'overdue' ? 'destructive' : 'secondary'
                    }>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{inv.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredInvoices.length} of {invoices.length} invoices | Generated: {new Date().toLocaleString()}
      </div>
    </div>
  )
}
