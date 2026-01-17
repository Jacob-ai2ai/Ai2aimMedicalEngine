'use client'

import { Builder } from '@builder.io/react'

// Register custom components for use in Builder.io
// These components can be dragged and dropped in the Builder.io visual editor

// Example: Medical Card Component
Builder.registerComponent(
  ({ title, description, icon }: { title: string; description: string; icon?: string }) => {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        {icon && <div className="text-4xl mb-4">{icon}</div>}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    )
  },
  {
    name: 'MedicalCard',
    inputs: [
      {
        name: 'title',
        type: 'string',
        required: true,
        defaultValue: 'Card Title',
      },
      {
        name: 'description',
        type: 'longText',
        required: true,
        defaultValue: 'Card description',
      },
      {
        name: 'icon',
        type: 'string',
        defaultValue: '🏥',
      },
    ],
  }
)

// Example: Prescription Status Badge
Builder.registerComponent(
  ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      filled: 'bg-green-100 text-green-800',
      dispensed: 'bg-purple-100 text-purple-800',
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    )
  },
  {
    name: 'PrescriptionStatusBadge',
    inputs: [
      {
        name: 'status',
        type: 'string',
        required: true,
        enum: ['pending', 'approved', 'rejected', 'filled', 'dispensed'],
        defaultValue: 'pending',
      },
    ],
  }
)

// Example: Patient Info Card
Builder.registerComponent(
  ({
    patientName,
    patientId,
    dateOfBirth,
    phone,
  }: {
    patientName: string
    patientId: string
    dateOfBirth?: string
    phone?: string
  }) => {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="font-semibold text-lg mb-2">{patientName}</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>ID: {patientId}</p>
          {dateOfBirth && <p>DOB: {dateOfBirth}</p>}
          {phone && <p>Phone: {phone}</p>}
        </div>
      </div>
    )
  },
  {
    name: 'PatientInfoCard',
    inputs: [
      {
        name: 'patientName',
        type: 'string',
        required: true,
        defaultValue: 'Patient Name',
      },
      {
        name: 'patientId',
        type: 'string',
        required: true,
        defaultValue: 'PAT-001',
      },
      {
        name: 'dateOfBirth',
        type: 'string',
      },
      {
        name: 'phone',
        type: 'string',
      },
    ],
  }
)

// Example: Statistics Card
Builder.registerComponent(
  ({
    label,
    value,
    change,
    trend,
  }: {
    label: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
  }) => {
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600',
    }

    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold mb-1">{value}</p>
        {change && (
          <p className={`text-sm ${trendColors[trend || 'neutral']}`}>{change}</p>
        )}
      </div>
    )
  },
  {
    name: 'StatisticsCard',
    inputs: [
      {
        name: 'label',
        type: 'string',
        required: true,
        defaultValue: 'Label',
      },
      {
        name: 'value',
        type: 'string',
        required: true,
        defaultValue: '0',
      },
      {
        name: 'change',
        type: 'string',
      },
      {
        name: 'trend',
        type: 'string',
        enum: ['up', 'down', 'neutral'],
        defaultValue: 'neutral',
      },
    ],
  }
)
