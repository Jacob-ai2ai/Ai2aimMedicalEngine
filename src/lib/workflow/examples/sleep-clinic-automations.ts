/**
 * Six Sleep Clinic Automation Examples
 * Pre-built workflows for common sleep clinic operations
 */

import { VisualWorkflow, VisualWorkflowNode, VisualWorkflowEdge } from '@/types/workflow-visual'
import { v4 as uuidv4 } from 'uuid'

function createNode(
  id: string,
  type: VisualWorkflowNode['data']['type'],
  label: string,
  position: { x: number; y: number },
  config: Record<string, any> = {}
): VisualWorkflowNode {
  return {
    id,
    type: 'workflowNode',
    position,
    data: {
      label,
      type,
      config,
      description: getNodeDescription(type)
    }
  }
}

function createEdge(source: string, target: string): VisualWorkflowEdge {
  return {
    id: `edge-${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
    animated: true
  }
}

function getNodeDescription(type: VisualWorkflowNode['data']['type']): string {
  const descriptions: Record<string, string> = {
    'trigger': 'Start workflow on event or schedule',
    'sleep-clinic-cpap': 'Check CPAP compliance or sync data',
    'condition': 'Conditional branching',
    'notification': 'Send notification',
    'sleep-clinic-dme': 'Manage DME equipment',
    'sleep-clinic-sleep-study': 'Dispatch or manage sleep studies',
    'database': 'Query or update database',
    'sleep-clinic-pft': 'Schedule or process PFT tests'
  }
  return descriptions[type] || ''
}

/**
 * Example 1: CPAP Compliance Alert Workflow
 */
export const cpapComplianceAlertWorkflow: VisualWorkflow = {
  id: uuidv4(),
  name: 'CPAP Compliance Daily Alert',
  description: 'Daily check CPAP compliance and alert clinicians if patients are below 70%',
  version: 1,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    createNode('trigger-1', 'trigger', 'Daily Schedule (9 AM)', { x: 250, y: 100 }, {
      triggerType: 'schedule',
      schedule: 'daily',
      hour: 9
    }),
    createNode('cpap-1', 'sleep-clinic-cpap', 'Check CPAP Compliance', { x: 250, y: 250 }, {
      action: 'check-compliance',
      days: 21
    }),
    createNode('condition-1', 'condition', 'Compliance < 70%?', { x: 250, y: 400 }, {
      field: 'compliance',
      operator: 'less_than',
      value: 70
    }),
    createNode('notif-1', 'notification', 'Alert Clinician', { x: 100, y: 550 }, {
      recipient: 'clinician@example.com',
      message: 'Patient has low CPAP compliance',
      subject: 'CPAP Compliance Alert'
    }),
    createNode('condition-2', 'condition', 'Insurance at Risk?', { x: 400, y: 550 }, {
      field: 'insuranceRisk',
      operator: 'equals',
      value: true
    }),
    createNode('notif-2', 'notification', 'Alert Billing Team', { x: 550, y: 700 }, {
      recipient: 'billing@example.com',
      message: 'Patient compliance may affect insurance coverage',
      subject: 'Insurance Risk Alert'
    }),
    createNode('db-1', 'database', 'Generate Report', { x: 250, y: 700 }, {
      table: 'reports',
      operation: 'insert',
      insertData: { type: 'compliance', date: 'today' }
    })
  ],
  edges: [
    createEdge('trigger-1', 'cpap-1'),
    createEdge('cpap-1', 'condition-1'),
    createEdge('condition-1', 'notif-1'),
    createEdge('condition-1', 'condition-2'),
    createEdge('condition-2', 'notif-2'),
    createEdge('condition-2', 'db-1')
  ]
}

/**
 * Example 2: Sleep Study Monitor Dispatch
 */
export const sleepStudyDispatchWorkflow: VisualWorkflow = {
  id: uuidv4(),
  name: 'Sleep Study Auto-Dispatch',
  description: 'Automatically dispatch monitor when sleep study is created',
  version: 1,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    createNode('trigger-1', 'trigger', 'Sleep Study Created', { x: 250, y: 100 }, {
      triggerType: 'event',
      eventType: 'sleep_study.created'
    }),
    createNode('sleep-study-1', 'sleep-clinic-sleep-study', 'Get Available Monitors', { x: 250, y: 250 }, {
      action: 'get-available'
    }),
    createNode('condition-1', 'condition', 'Monitors Available?', { x: 250, y: 400 }, {
      field: 'monitors.length',
      operator: 'greater_than',
      value: 0
    }),
    createNode('sleep-study-2', 'sleep-clinic-sleep-study', 'Dispatch Monitor', { x: 100, y: 550 }, {
      action: 'dispatch'
    }),
    createNode('notif-1', 'notification', 'Notify Patient', { x: 100, y: 700 }, {
      recipient: 'patient@example.com',
      message: 'Sleep study monitor has been dispatched',
      subject: 'Monitor Dispatch Notification'
    }),
    createNode('notif-2', 'notification', 'Alert Inventory Team', { x: 400, y: 550 }, {
      recipient: 'inventory@example.com',
      message: 'No available monitors for sleep study',
      subject: 'Monitor Shortage Alert'
    }),
    createNode('db-1', 'database', 'Schedule Return Reminder', { x: 100, y: 850 }, {
      table: 'tasks',
      operation: 'insert',
      insertData: { type: 'reminder', days: 7 }
    })
  ],
  edges: [
    createEdge('trigger-1', 'sleep-study-1'),
    createEdge('sleep-study-1', 'condition-1'),
    createEdge('condition-1', 'sleep-study-2'),
    createEdge('condition-1', 'notif-2'),
    createEdge('sleep-study-2', 'notif-1'),
    createEdge('notif-1', 'db-1')
  ]
}

/**
 * Example 3: DME Prescription Authorization
 */
export const dmePrescriptionAuthWorkflow: VisualWorkflow = {
  id: uuidv4(),
  name: 'DME Prescription Auto-Authorization',
  description: 'Auto-check insurance and generate authorization request for DME prescriptions',
  version: 1,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    createNode('trigger-1', 'trigger', 'DME Prescription Created', { x: 250, y: 100 }, {
      triggerType: 'event',
      eventType: 'dme_prescription.created'
    }),
    createNode('db-1', 'database', 'Get Prescription Details', { x: 250, y: 250 }, {
      table: 'dme_prescriptions',
      operation: 'select'
    }),
    createNode('condition-1', 'condition', 'Authorization Required?', { x: 250, y: 400 }, {
      field: 'insurance_code',
      operator: 'not_equals',
      value: null
    }),
    createNode('db-2', 'database', 'Query Patient Insurance', { x: 100, y: 550 }, {
      table: 'patients',
      operation: 'select'
    }),
    createNode('db-3', 'database', 'Generate Auth Request', { x: 100, y: 700 }, {
      table: 'authorization_requests',
      operation: 'insert'
    }),
    createNode('api-1', 'api-call', 'Send to Insurance Portal', { x: 100, y: 850 }, {
      url: '/api/insurance/submit-authorization',
      method: 'POST'
    }),
    createNode('db-4', 'database', 'Track Authorization Status', { x: 100, y: 1000 }, {
      table: 'authorization_requests',
      operation: 'update'
    }),
    createNode('notif-1', 'notification', 'Notify When Approved', { x: 100, y: 1150 }, {
      recipient: 'clinician@example.com',
      message: 'DME authorization has been approved',
      subject: 'Authorization Approved'
    })
  ],
  edges: [
    createEdge('trigger-1', 'db-1'),
    createEdge('db-1', 'condition-1'),
    createEdge('condition-1', 'db-2'),
    createEdge('db-2', 'db-3'),
    createEdge('db-3', 'api-1'),
    createEdge('api-1', 'db-4'),
    createEdge('db-4', 'notif-1')
  ]
}

/**
 * Example 4: PFT Test Results Processing
 */
export const pftResultsProcessingWorkflow: VisualWorkflow = {
  id: uuidv4(),
  name: 'PFT Results Auto-Processing',
  description: 'Process PFT test results, generate interpretation draft, and assign to pulmonologist',
  version: 1,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    createNode('trigger-1', 'trigger', 'PFT Results Uploaded', { x: 250, y: 100 }, {
      triggerType: 'event',
      eventType: 'pft_results.uploaded'
    }),
    createNode('db-1', 'database', 'Validate Results Data', { x: 250, y: 250 }, {
      table: 'pft_results',
      operation: 'select'
    }),
    createNode('pft-1', 'sleep-clinic-pft', 'Calculate Predicted Values', { x: 250, y: 400 }, {
      action: 'calculate'
    }),
    createNode('pft-2', 'sleep-clinic-pft', 'Compare to Previous Tests', { x: 250, y: 550 }, {
      action: 'compare'
    }),
    createNode('condition-1', 'condition', 'Significant Change?', { x: 250, y: 700 }, {
      field: 'changePercent',
      operator: 'greater_than',
      value: 15
    }),
    createNode('ai-1', 'ai-agent', 'Generate Interpretation Draft', { x: 100, y: 850 }, {
      agentRole: 'physician',
      message: 'Generate PFT interpretation based on results'
    }),
    createNode('db-2', 'database', 'Save Interpretation', { x: 100, y: 1000 }, {
      table: 'pft_interpretations',
      operation: 'insert'
    }),
    createNode('db-3', 'database', 'Assign to Pulmonologist', { x: 100, y: 1150 }, {
      table: 'tasks',
      operation: 'insert',
      insertData: { type: 'pft_review', assignedTo: 'pulmonologist' }
    }),
    createNode('notif-1', 'notification', 'Notify Referring Physician', { x: 100, y: 1300 }, {
      recipient: 'referring@example.com',
      message: 'PFT test results are ready for review',
      subject: 'PFT Results Ready'
    })
  ],
  edges: [
    createEdge('trigger-1', 'db-1'),
    createEdge('db-1', 'pft-1'),
    createEdge('pft-1', 'pft-2'),
    createEdge('pft-2', 'condition-1'),
    createEdge('condition-1', 'ai-1'),
    createEdge('ai-1', 'db-2'),
    createEdge('db-2', 'db-3'),
    createEdge('db-3', 'notif-1')
  ]
}

/**
 * Example 5: Equipment Maintenance Reminder
 */
export const equipmentMaintenanceWorkflow: VisualWorkflow = {
  id: uuidv4(),
  name: 'Equipment Maintenance Reminder',
  description: 'Weekly check for equipment needing maintenance and send reminders',
  version: 1,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    createNode('trigger-1', 'trigger', 'Weekly Schedule (Monday 8 AM)', { x: 250, y: 100 }, {
      triggerType: 'schedule',
      schedule: 'weekly',
      day: 'monday',
      hour: 8
    }),
    createNode('db-1', 'database', 'Query Equipment Due for Maintenance', { x: 250, y: 250 }, {
      table: 'dme_inventory',
      operation: 'select',
      filter: { maintenance_due: 'within_30_days' }
    }),
    createNode('db-2', 'database', 'Filter by Location', { x: 250, y: 400 }, {
      table: 'dme_inventory',
      operation: 'select'
    }),
    createNode('db-3', 'database', 'Generate Maintenance Schedule', { x: 250, y: 550 }, {
      table: 'maintenance_schedules',
      operation: 'insert'
    }),
    createNode('db-4', 'database', 'Assign to Technician', { x: 250, y: 700 }, {
      table: 'tasks',
      operation: 'insert',
      insertData: { type: 'maintenance', assignedTo: 'technician' }
    }),
    createNode('condition-1', 'condition', 'Patient-Owned Equipment?', { x: 250, y: 850 }, {
      field: 'ownership',
      operator: 'equals',
      value: 'patient'
    }),
    createNode('notif-1', 'notification', 'Send Reminder to Patient', { x: 100, y: 1000 }, {
      recipient: 'patient@example.com',
      message: 'Your equipment needs maintenance',
      subject: 'Equipment Maintenance Reminder'
    }),
    createNode('db-5', 'database', 'Update Equipment Status', { x: 400, y: 1000 }, {
      table: 'dme_inventory',
      operation: 'update',
      updateData: { status: 'maintenance_scheduled' }
    })
  ],
  edges: [
    createEdge('trigger-1', 'db-1'),
    createEdge('db-1', 'db-2'),
    createEdge('db-2', 'db-3'),
    createEdge('db-3', 'db-4'),
    createEdge('db-4', 'condition-1'),
    createEdge('condition-1', 'notif-1'),
    createEdge('condition-1', 'db-5')
  ]
}

/**
 * Example 6: Referral Form Auto-Processing
 */
export const referralFormProcessingWorkflow: VisualWorkflow = {
  id: uuidv4(),
  name: 'Referral Form Auto-Processing',
  description: 'Process incoming referral forms, extract data, and schedule appropriate tests',
  version: 1,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  nodes: [
    createNode('trigger-1', 'trigger', 'Referral Form Received', { x: 250, y: 100 }, {
      triggerType: 'event',
      eventType: 'referral_form.received'
    }),
    createNode('ai-1', 'ai-agent', 'Extract Referral Data (OCR/AI)', { x: 250, y: 250 }, {
      agentRole: 'administrative',
      message: 'Extract patient and referral information from form'
    }),
    createNode('db-1', 'database', 'Validate Required Fields', { x: 250, y: 400 }, {
      table: 'referral_forms',
      operation: 'select'
    }),
    createNode('condition-1', 'condition', 'Patient Exists?', { x: 250, y: 550 }, {
      field: 'patientId',
      operator: 'not_equals',
      value: null
    }),
    createNode('db-2', 'database', 'Create Patient Record', { x: 100, y: 700 }, {
      table: 'patients',
      operation: 'insert'
    }),
    createNode('condition-2', 'condition', 'Test Type Required?', { x: 400, y: 700 }, {
      field: 'testType',
      operator: 'not_equals',
      value: null
    }),
    createNode('sleep-study-1', 'sleep-clinic-sleep-study', 'Schedule HSAT', { x: 300, y: 850 }, {
      action: 'schedule'
    }),
    createNode('pft-1', 'sleep-clinic-pft', 'Schedule PFT', { x: 500, y: 850 }, {
      action: 'schedule'
    }),
    createNode('notif-1', 'notification', 'Notify Referring Physician', { x: 250, y: 1000 }, {
      recipient: 'referring@example.com',
      message: 'Referral has been processed and patient scheduled',
      subject: 'Referral Processed'
    }),
    createNode('db-3', 'database', 'Add to Clinician Queue', { x: 250, y: 1150 }, {
      table: 'tasks',
      operation: 'insert',
      insertData: { type: 'referral_review', priority: 'normal' }
    })
  ],
  edges: [
    createEdge('trigger-1', 'ai-1'),
    createEdge('ai-1', 'db-1'),
    createEdge('db-1', 'condition-1'),
    createEdge('condition-1', 'db-2'),
    createEdge('condition-1', 'condition-2'),
    createEdge('condition-2', 'sleep-study-1'),
    createEdge('condition-2', 'pft-1'),
    createEdge('sleep-study-1', 'notif-1'),
    createEdge('pft-1', 'notif-1'),
    createEdge('notif-1', 'db-3')
  ]
}

/**
 * Export all examples
 */
export const sleepClinicWorkflowExamples = [
  cpapComplianceAlertWorkflow,
  sleepStudyDispatchWorkflow,
  dmePrescriptionAuthWorkflow,
  pftResultsProcessingWorkflow,
  equipmentMaintenanceWorkflow,
  referralFormProcessingWorkflow
]
