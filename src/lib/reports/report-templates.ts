/**
 * Report Templates Configuration
 * Definitions for all standard reports in the system
 */

import { ReportConfig } from './report-builder'

export const REPORT_TEMPLATES: Record<string, ReportConfig> = {
  // ============================================================================
  // PRODUCTIVITY REPORTS
  // ============================================================================
  
  clinicianProductivity: {
    id: 'clinician-productivity',
    title: 'Clinician Productivity Report',
    description: 'Individual staff productivity metrics by date range',
    category: 'productivity',
    dataSource: '/api/productivity/staff',
    columns: [
      { id: 'staffName', label: 'Clinician', field: 'staffName', type: 'text', sortable: true },
      { id: 'role', label: 'Role', field: 'role', type: 'text', filterable: true },
      { id: 'utilizationRate', label: 'Utilization %', field: 'utilizationRate', type: 'percentage', sortable: true },
      { id: 'appointmentsCompleted', label: 'Appointments', field: 'appointmentsCompleted', type: 'number', aggregate: 'sum' },
      { id: 'totalHours', label: 'Hours Worked', field: 'completedHours', type: 'number', aggregate: 'sum' },
      { id: 'revenue', label: 'Revenue', field: 'revenueActual', type: 'currency', aggregate: 'sum' },
      { id: 'revenuePerHour', label: '$/Hour', field: 'revenuePerHour', type: 'currency', sortable: true }
    ],
    defaultSort: { field: 'utilizationRate', direction: 'desc' },
    aggregations: [
      { field: 'appointmentsCompleted', function: 'sum', label: 'Total Appointments' },
      { field: 'revenueActual', function: 'sum', label: 'Total Revenue' },
      { field: 'completedHours', function: 'sum', label: 'Total Hours' }
    ]
  },

  billingProductivity: {
    id: 'billing-productivity',
    title: 'Billing Productivity Report',
    description: 'Revenue and billing metrics by service type',
    category: 'productivity',
    dataSource: '/api/reports/billing-productivity',
    columns: [
      { id: 'date', label: 'Date', field: 'date', type: 'date', sortable: true },
      { id: 'serviceType', label: 'Service Type', field: 'serviceType', type: 'text', filterable: true },
      { id: 'volume', label: 'Volume', field: 'volume', type: 'number', aggregate: 'sum' },
      { id: 'billed', label: 'Amount Billed', field: 'billed', type: 'currency', aggregate: 'sum' },
      { id: 'collected', label: 'Amount Collected', field: 'collected', type: 'currency', aggregate: 'sum' },
      { id: 'outstanding', label: 'Outstanding', field: 'outstanding', type: 'currency', aggregate: 'sum' }
    ],
    aggregations: [
      { field: 'volume', function: 'sum', label: 'Total Services' },
      { field: 'billed', function: 'sum', label: 'Total Billed' },
      { field: 'collected', function: 'sum', label: 'Total Collected' }
    ]
  },

  // ============================================================================
  // MARKETING REPORTS
  // ============================================================================

  referralSource: {
    id: 'referral-source',
    title: 'Marketing Referral Source Report',
    description: 'Track patient acquisition by referral source',
    category: 'marketing',
    dataSource: '/api/reports/referral-sources',
    columns: [
      { id: 'source', label: 'Referral Source', field: 'source', type: 'text', sortable: true },
      { id: 'newPatients', label: 'New Patients', field: 'newPatients', type: 'number', aggregate: 'sum' },
      { id: 'appointments', label: 'Appointments', field: 'appointments', type: 'number', aggregate: 'sum' },
      { id: 'revenue', label: 'Revenue', field: 'revenue', type: 'currency', aggregate: 'sum' },
      { id: 'conversionRate', label: 'Conversion %', field: 'conversionRate', type: 'percentage', sortable: true }
    ],
    defaultSort: { field: 'newPatients', direction: 'desc' }
  },

  conversionTracking: {
    id: 'conversion-tracking',
    title: 'Conversion Report',
    description: 'Track conversion rates from leads to patients',
    category: 'marketing',
    dataSource: '/api/reports/conversions',
    columns: [
      { id: 'period', label: 'Period', field: 'period', type: 'text', sortable: true },
      { id: 'leads', label: 'Leads', field: 'leads', type: 'number', aggregate: 'sum' },
      { id: 'contacted', label: 'Contacted', field: 'contacted', type: 'number', aggregate: 'sum' },
      { id: 'scheduled', label: 'Scheduled', field: 'scheduled', type: 'number', aggregate: 'sum' },
      { id: 'converted', label: 'Converted', field: 'converted', type: 'number', aggregate: 'sum' },
      { id: 'conversionRate', label: 'Rate %', field: 'conversionRate', type: 'percentage', sortable: true }
    ]
  },

  // ============================================================================
  // BILLING REPORTS
  // ============================================================================

  invoiceSummary: {
    id: 'invoice-summary',
    title: 'Invoice Summary Report',
    description: 'Summary of all invoices by status and period',
    category: 'billing',
    dataSource: '/api/reports/invoices',
    columns: [
      { id: 'invoiceNumber', label: 'Invoice #', field: 'invoiceNumber', type: 'text', sortable: true },
      { id: 'patient', label: 'Patient', field: 'patientName', type: 'text', filterable: true },
      { id: 'date', label: 'Date', field: 'date', type: 'date', sortable: true },
      { id: 'amount', label: 'Amount', field: 'amount', type: 'currency', aggregate: 'sum' },
      { id: 'status', label: 'Status', field: 'status', type: 'badge', filterable: true },
      { id: 'dueDate', label: 'Due Date', field: 'dueDate', type: 'date', sortable: true }
    ],
    aggregations: [
      { field: 'amount', function: 'sum', label: 'Total Amount' }
    ]
  },

  arAging: {
    id: 'ar-aging',
    title: 'AR Aging Report',
    description: 'Accounts receivable aging analysis',
    category: 'billing',
    dataSource: '/api/reports/ar-aging',
    columns: [
      { id: 'patient', label: 'Patient', field: 'patientName', type: 'text', sortable: true },
      { id: 'current', label: 'Current (0-30)', field: 'current', type: 'currency', aggregate: 'sum' },
      { id: 'days30to60', label: '30-60 Days', field: 'days30to60', type: 'currency', aggregate: 'sum' },
      { id: 'days60to90', label: '60-90 Days', field: 'days60to90', type: 'currency', aggregate: 'sum' },
      { id: 'over90', label: 'Over 90 Days', field: 'over90', type: 'currency', aggregate: 'sum' },
      { id: 'total', label: 'Total AR', field: 'total', type: 'currency', aggregate: 'sum' }
    ],
    aggregations: [
      { field: 'total', function: 'sum', label: 'Total AR Balance' }
    ]
  },

  // ============================================================================
  // CLINICAL REPORTS
  // ============================================================================

  diagnosisReport: {
    id: 'diagnosis-report',
    title: 'Diagnosis Distribution Report',
    description: 'Patient diagnoses and treatment patterns',
    category: 'clinical',
    dataSource: '/api/reports/diagnoses',
    columns: [
      { id: 'diagnosis', label: 'Diagnosis', field: 'diagnosis', type: 'text', sortable: true },
      { id: 'icd10', label: 'ICD-10 Code', field: 'icd10Code', type: 'text' },
      { id: 'count', label: 'Patient Count', field: 'patientCount', type: 'number', aggregate: 'sum' },
      { id: 'percentage', label: '% of Total', field: 'percentage', type: 'percentage' },
      { id: 'avgTreatmentCost', label: 'Avg Cost', field: 'avgTreatmentCost', type: 'currency' }
    ],
    defaultSort: { field: 'patientCount', direction: 'desc' }
  },

  encounterVolume: {
    id: 'encounter-volume',
    title: 'Encounter Volume Report',
    description: 'Patient encounters by type and period',
    category: 'clinical',
    dataSource: '/api/reports/encounters',
    columns: [
      { id: 'date', label: 'Date', field: 'date', type: 'date', sortable: true },
      { id: 'encounterType', label: 'Type', field: 'encounterType', type: 'text', filterable: true },
      { id: 'count', label: 'Count', field: 'count', type: 'number', aggregate: 'sum' },
      { id: 'avgDuration', label: 'Avg Duration (min)', field: 'avgDuration', type: 'number' },
      { id: 'revenue', label: 'Revenue', field: 'revenue', type: 'currency', aggregate: 'sum' }
    ]
  },

  // ============================================================================
  // INVENTORY REPORTS
  // ============================================================================

  inventoryValuation: {
    id: 'inventory-valuation',
    title: 'Inventory Valuation Report',
    description: 'Current inventory value and stock levels',
    category: 'inventory',
    dataSource: '/api/reports/inventory-valuation',
    columns: [
      { id: 'item', label: 'Item', field: 'itemName', type: 'text', sortable: true },
      { id: 'category', label: 'Category', field: 'category', type: 'text', filterable: true },
      { id: 'quantity', label: 'Quantity', field: 'quantityOnHand', type: 'number', aggregate: 'sum' },
      { id: 'unitCost', label: 'Unit Cost', field: 'unitCost', type: 'currency' },
      { id: 'totalValue', label: 'Total Value', field: 'totalValue', type: 'currency', aggregate: 'sum' },
      { id: 'location', label: 'Location', field: 'location', type: 'text', filterable: true }
    ],
    aggregations: [
      { field: 'totalValue', function: 'sum', label: 'Total Inventory Value' }
    ]
  },

  serialNumberTracking: {
    id: 'serial-number-tracking',
    title: 'Serial Number Tracking Report',
    description: 'Track equipment by serial number and assignment',
    category: 'inventory',
    dataSource: '/api/reports/serial-numbers',
    columns: [
      { id: 'serialNumber', label: 'Serial Number', field: 'serialNumber', type: 'text', sortable: true },
      { id: 'equipment', label: 'Equipment', field: 'equipmentName', type: 'text', filterable: true },
      { id: 'patient', label: 'Assigned To', field: 'assignedPatient', type: 'text' },
      { id: 'assignedDate', label: 'Assigned Date', field: 'assignedDate', type: 'date', sortable: true },
      { id: 'status', label: 'Status', field: 'status', type: 'badge', filterable: true },
      { id: 'location', label: 'Location', field: 'location', type: 'text', filterable: true }
    ]
  }
}

// Helper function to get report config
export function getReportTemplate(reportId: string): ReportConfig | null {
  return REPORT_TEMPLATES[reportId] || null
}

// Get all reports by category
export function getReportsByCategory(category: string): ReportConfig[] {
  return Object.values(REPORT_TEMPLATES).filter(report => report.category === category)
}

// Get all report categories
export function getAllCategories(): string[] {
  return ['productivity', 'billing', 'marketing', 'clinical', 'inventory']
}
