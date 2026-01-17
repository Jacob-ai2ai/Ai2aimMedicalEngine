/**
 * Sleep Clinic Invoices & Billing
 * Manage invoices for sleep studies, CPAP setups, and services
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// Dummy invoice data
const DUMMY_INVOICES = [
  {
    id: 'INV-2601-001',
    invoiceNumber: 'INV-2601-001',
    patient: { name: 'John Smith', mrn: 'MRN-12345' },
    date: '2026-01-15',
    dueDate: '2026-02-15',
    services: [
      { code: 'HSAT-001', description: 'Home Sleep Study - ApneaLink', qty: 1, unitPrice: 650.00, total: 650.00 },
      { code: 'CONS-001', description: 'Sleep Consultation', qty: 1, unitPrice: 200.00, total: 200.00 }
    ],
    subtotal: 850.00,
    tax: 42.50,
    total: 892.50,
    status: 'unpaid',
    insurance: { provider: 'Alberta Blue Cross', claimNumber: 'ABC-2601-0015', claimStatus: 'submitted', claimAmount: 650.00 },
    patientResponsibility: 242.50
  },
  {
    id: 'INV-2601-002',
    invoiceNumber: 'INV-2601-002',
    patient: { name: 'Mary Johnson', mrn: 'MRN-12346' },
    date: '2026-01-14',
    dueDate: '2026-02-14',
    services: [
      { code: 'CPAP-SETUP', description: 'CPAP Machine Setup & Training', qty: 1, unitPrice: 1000.00, total: 1000.00 },
      { code: 'CPAP-RENTAL', description: 'CPAP Rental (3 months)', qty: 1, unitPrice: 250.00, total: 250.00 }
    ],
    subtotal: 1250.00,
    tax: 62.50,
    total: 1312.50,
    status: 'paid',
    paidDate: '2026-01-16',
    paymentMethod: 'Insurance + Credit Card',
    insurance: { provider: 'Manulife', claimNumber: 'MAN-2601-0042', claimStatus: 'approved', claimAmount: 1000.00 },
    patientResponsibility: 312.50,
    amountPaid: 1312.50
  },
  {
    id: 'INV-2601-003',
    invoiceNumber: 'INV-2601-003',
    patient: { name: 'Robert Wilson', mrn: 'MRN-12347' },
    date: '2026-01-13',
    dueDate: '2026-02-13',
    services: [
      { code: 'PFT-FULL', description: 'Complete PFT with Interpretation', qty: 1, unitPrice: 400.00, total: 400.00 },
      { code: 'PFT-REPORT', description: 'Physician Report', qty: 1, unitPrice: 50.00, total: 50.00 }
    ],
    subtotal: 450.00,
    tax: 22.50,
    total: 472.50,
    status: 'pending',
    insurance: { provider: 'Sunlife', claimNumber: null, claimStatus: 'not_submitted', claimAmount: 0 },
    patientResponsibility: 472.50
  }
]

export default function SleepClinicInvoicesPage() {
  const [invoices, setInvoices] = useState(DUMMY_INVOICES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = !search || 
      inv.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const summary = {
    total: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
    unpaid: filteredInvoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.total, 0),
    pending: filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
    paid: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices & Billing</h1>
          <p className="text-muted-foreground">Manage sleep clinic invoices and track payments</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/sleep-clinic/invoices/new'}>
          + Create Invoice
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Invoiced</div>
          <div className="text-2xl font-bold">${summary.total.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Unpaid</div>
          <div className="text-2xl font-bold text-red-600">${summary.unpaid.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">${summary.pending.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-2xl font-bold text-green-600">${summary.paid.toFixed(2)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search by patient name or invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>
              All
            </Button>
            <Button variant={statusFilter === 'unpaid' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('unpaid')}>
              Unpaid
            </Button>
            <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('pending')}>
              Pending
            </Button>
            <Button variant={statusFilter === 'paid' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('paid')}>
              Paid
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map(invoice => (
          <Card key={invoice.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{invoice.invoiceNumber}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  Patient: {invoice.patient.name} ({invoice.patient.mrn})
                </div>
              </div>
              <div className="text-right">
                <Badge variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'unpaid' ? 'destructive' : 'secondary'
                }>
                  {invoice.status}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Due: {invoice.dueDate}
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="border rounded p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Service</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Unit Price</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.services.map((service, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">
                        <div className="font-medium">{service.description}</div>
                        <div className="text-xs text-muted-foreground">{service.code}</div>
                      </td>
                      <td className="text-center p-2">{service.qty}</td>
                      <td className="text-right p-2">${service.unitPrice.toFixed(2)}</td>
                      <td className="text-right p-2">${service.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (5%):</span>
                  <span>${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Insurance & Payment */}
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm font-semibold mb-2">Insurance Claim</div>
                <div className="text-xs space-y-1">
                  <div>Provider: {invoice.insurance.provider}</div>
                  {invoice.insurance.claimNumber && <div>Claim #: {invoice.insurance.claimNumber}</div>}
                  <div>Status: <Badge variant={invoice.insurance.claimStatus === 'approved' ? 'default' : 'secondary'}>{invoice.insurance.claimStatus}</Badge></div>
                  <div>Claim Amount: ${invoice.insurance.claimAmount.toFixed(2)}</div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm font-semibold mb-2">Patient Responsibility</div>
                <div className="text-2xl font-bold text-green-900">${invoice.patientResponsibility.toFixed(2)}</div>
                {invoice.amountPaid && (
                  <div className="text-xs mt-1">
                    Paid: ${invoice.amountPaid.toFixed(2)} on {invoice.paidDate}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/dashboard/sleep-clinic/invoices/${invoice.id}`}>
                View Details
              </Button>
              {invoice.status !== 'paid' && (
                <>
                  <Button size="sm" onClick={() => alert('Record payment functionality')}>
                    Record Payment
                  </Button>
                  {invoice.insurance.claimStatus === 'not_submitted' && (
                    <Button size="sm" variant="outline" onClick={() => alert('Submit insurance claim')}>
                      Submit Claim
                    </Button>
                  )}
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => alert('Download PDF')}>
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => alert('Email to patient')}>
                Email Invoice
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No invoices found</p>
        </Card>
      )}
    </div>
  )
}
