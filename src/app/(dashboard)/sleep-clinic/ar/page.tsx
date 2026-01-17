/**
 * Accounts Receivable (AR) Management
 * Track outstanding payments, aging, and collections for sleep clinic
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Dummy AR data
const DUMMY_AR_DATA = {
  summary: {
    totalAR: 45280.50,
    current: 15420.00,      // 0-30 days
    days30to60: 12850.50,   // 30-60 days
    days60to90: 8910.00,    // 60-90 days
    over90days: 8100.00,    // >90 days
    averageDaysToPayment: 42
  },
  accounts: [
    {
      id: 'AR-001',
      patient: { name: 'John Smith', mrn: 'MRN-12345', phone: '780-555-0101' },
      balance: 892.50,
      invoices: [
        { number: 'INV-2601-001', date: '2026-01-15', amount: 892.50, dueDate: '2026-02-15', age: 2 }
      ],
      lastPayment: null,
      status: 'current'
    },
    {
      id: 'AR-002',
      patient: { name: 'Sarah Davis', mrn: 'MRN-12348', phone: '780-555-0104' },
      balance: 2450.75,
      invoices: [
        { number: 'INV-2512-045', date: '2025-12-20', amount: 1250.00, dueDate: '2026-01-20', age: 28 },
        { number: 'INV-2601-010', date: '2026-01-08', amount: 1200.75, dueDate: '2026-02-08', age: 9 }
      ],
      lastPayment: { date: '2025-12-15', amount: 500.00 },
      status: 'current'
    },
    {
      id: 'AR-003',
      patient: { name: 'Michael Brown', mrn: 'MRN-12349', phone: '780-555-0105' },
      balance: 3250.00,
      invoices: [
        { number: 'INV-2511-088', date: '2025-11-25', amount: 1500.00, dueDate: '2025-12-25', age: 53 },
        { number: 'INV-2512-020', date: '2025-12-10', amount: 1750.00, dueDate: '2026-01-10', age: 38 }
      ],
      lastPayment: { date: '2025-11-01', amount: 750.00 },
      status: '30-60',
      collectionNotes: 'Left voicemail 2026-01-10, awaiting callback'
    },
    {
      id: 'AR-004',
      patient: { name: 'Patricia Wilson', mrn: 'MRN-12350', phone: '780-555-0106' },
      balance: 4890.00,
      invoices: [
        { number: 'INV-2510-062', date: '2025-10-15', amount: 2340.00, dueDate: '2025-11-15', age: 94 },
        { number: 'INV-2511-033', date: '2025-11-20', amount: 2550.00, dueDate: '2025-12-20', age: 59 }
      ],
      lastPayment: { date: '2025-09-30', amount: 1000.00 },
      status: 'over90',
      collectionNotes: 'Sent to collections 2026-01-05'
    }
  ]
}

export default function ARManagementPage() {
  const [accounts, setAccounts] = useState(DUMMY_AR_DATA.accounts)
  const [search, setSearch] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !search || 
      account.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      account.patient.mrn.toLowerCase().includes(search.toLowerCase())
    const matchesAge = ageFilter === 'all' || account.status === ageFilter
    return matchesSearch && matchesAge
  })

  const { summary } = DUMMY_AR_DATA

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts Receivable</h1>
          <p className="text-muted-foreground">Track outstanding payments and manage collections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/sleep-clinic/ar/report'}>
            AR Aging Report
          </Button>
          <Button onClick={() => window.location.href = '/dashboard/sleep-clinic/payments/record'}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* AR Summary */}
      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-4">AR Aging Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total AR</div>
            <div className="text-2xl font-bold">${summary.totalAR.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Current (0-30)</div>
            <div className="text-xl font-bold text-green-600">${summary.current.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">30-60 Days</div>
            <div className="text-xl font-bold text-yellow-600">${summary.days30to60.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">60-90 Days</div>
            <div className="text-xl font-bold text-orange-600">${summary.days60to90.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Over 90 Days</div>
            <div className="text-xl font-bold text-red-600">${summary.over90days.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Avg Days to Pay</div>
            <div className="text-xl font-bold">{summary.averageDaysToPayment}</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant={ageFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setAgeFilter('all')}>
          All
        </Button>
        <Button variant={ageFilter === 'current' ? 'default' : 'outline'} size="sm" onClick={() => setAgeFilter('current')}>
          Current
        </Button>
        <Button variant={ageFilter === '30-60' ? 'default' : 'outline'} size="sm" onClick={() => setAgeFilter('30-60')}>
          30-60 Days
        </Button>
        <Button variant={ageFilter === '60-90' ? 'default' : 'outline'} size="sm" onClick={() => setAgeFilter('60-90')}>
          60-90 Days
        </Button>
        <Button variant={ageFilter === 'over90' ? 'default' : 'outline'} size="sm" onClick={() => setAgeFilter('over90')}>
          Over 90 Days
        </Button>
      </div>

      {/* AR Accounts */}
      <div className="space-y-4">
        {filteredAccounts.map(account => (
          <Card key={account.id} className={`p-6 ${account.status === 'over90' ? 'border-red-500' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{account.patient.name}</h3>
                <div className="text-sm text-muted-foreground">
                  MRN: {account.patient.mrn} • Phone: {account.patient.phone}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">${account.balance.toFixed(2)}</div>
                <Badge variant={
                  account.status === 'current' ? 'default' :
                  account.status === '30-60' ? 'secondary' :
                  account.status === '60-90' ? 'secondary' : 'destructive'
                }>
                  {account.status}
                </Badge>
              </div>
            </div>

            {/* Outstanding Invoices */}
            <div className="mb-4">
              <div className="text-sm font-semibold mb-2">Outstanding Invoices</div>
              <div className="space-y-2">
                {account.invoices.map(inv => (
                  <div key={inv.number} className="flex items-center justify-between p-3 bg-muted rounded text-sm">
                    <div>
                      <div className="font-medium">{inv.number}</div>
                      <div className="text-xs text-muted-foreground">Invoice Date: {inv.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${inv.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {inv.age} days old • Due: {inv.dueDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {account.lastPayment && (
              <div className="mb-4 p-3 bg-green-50 rounded text-sm">
                <span className="font-semibold">Last Payment:</span> ${account.lastPayment.amount.toFixed(2)} on {account.lastPayment.date}
              </div>
            )}

            {account.collectionNotes && (
              <div className="mb-4 p-3 bg-yellow-50 rounded text-sm">
                <span className="font-semibold">Collection Notes:</span> {account.collectionNotes}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => alert('Record payment')}>
                Record Payment
              </Button>
              <Button size="sm" variant="outline" onClick={() => alert('Send statement')}>
                Send Statement
              </Button>
              <Button size="sm" variant="outline" onClick={() => alert('Call patient')}>
                Call Patient
              </Button>
              <Button size="sm" variant="outline" onClick={() => alert('Add collection note')}>
                Add Note
              </Button>
              {account.status === 'over90' && (
                <Button size="sm" variant="destructive" onClick={() => alert('Send to collections')}>
                  Send to Collections
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
