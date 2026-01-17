# Automations Documentation

## Overview

The automation system allows you to automate any business function with triggers and actions. Every task and function should have automation capabilities.

## Trigger Types

### 1. Event Triggers
Triggered by database events or application events.

**Configuration**:
```json
{
  "type": "event",
  "config": {
    "eventType": "prescription.created",
    "table": "prescriptions"
  }
}
```

**Available Events**:
- `prescription.created`
- `prescription.updated`
- `prescription.status_changed`
- `patient.created`
- `communication.received`
- `automation.completed`

### 2. Schedule Triggers
Triggered on a schedule (daily, hourly, custom).

**Configuration**:
```json
{
  "type": "schedule",
  "config": {
    "schedule": "daily",
    "hour": 9,
    "timezone": "America/New_York"
  }
}
```

**Schedule Options**:
- `daily` - Run once per day at specified hour
- `hourly` - Run every hour
- `weekly` - Run weekly on specified day
- `custom` - Cron expression

### 3. Condition Triggers
Triggered when conditions are met.

**Configuration**:
```json
{
  "type": "condition",
  "config": {
    "field": "status",
    "operator": "equals",
    "value": "pending"
  }
}
```

**Operators**:
- `equals`
- `not_equals`
- `greater_than`
- `less_than`
- `contains`

### 4. Webhook Triggers
Triggered by external webhooks.

**Configuration**:
```json
{
  "type": "webhook",
  "config": {
    "endpoint": "/api/automations/webhook/automation-id",
    "secret": "webhook-secret"
  }
}
```

## Action Types

### 1. Notification Actions
Send notifications (email, in-app, SMS).

**Configuration**:
```json
{
  "type": "notification",
  "config": {
    "recipient": "user-id",
    "subject": "Prescription Approved",
    "message": "Your prescription has been approved"
  }
}
```

### 2. Task Actions
Execute system tasks.

**Configuration**:
```json
{
  "type": "task",
  "config": {
    "taskType": "update_prescription_status",
    "taskData": {
      "prescriptionId": "prescription-id",
      "status": "approved"
    }
  }
}
```

**Available Tasks**:
- `update_prescription_status`
- `create_communication`
- `update_patient`
- `send_email`

### 3. API Call Actions
Make external API calls.

**Configuration**:
```json
{
  "type": "api_call",
  "config": {
    "url": "https://api.example.com/endpoint",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer token"
    },
    "body": {
      "data": "value"
    }
  }
}
```

### 4. AI Agent Actions
Invoke AI agents.

**Configuration**:
```json
{
  "type": "ai_agent",
  "config": {
    "agentRole": "pharmacist",
    "message": "Verify this prescription",
    "context": {
      "prescriptionId": "prescription-id"
    }
  }
}
```

### 5. Workflow Actions
Execute multi-step workflows.

**Configuration**:
```json
{
  "type": "workflow",
  "config": {
    "workflowId": "workflow-id",
    "steps": [
      {
        "type": "task",
        "config": { ... }
      },
      {
        "type": "notification",
        "config": { ... }
      }
    ]
  }
}
```

## Creating Automations

### Via API

```bash
POST /api/automations
{
  "name": "Auto-approve prescriptions",
  "trigger": {
    "type": "event",
    "config": {
      "eventType": "prescription.created"
    }
  },
  "action": {
    "type": "ai_agent",
    "config": {
      "agentRole": "pharmacist",
      "message": "Review and approve this prescription"
    }
  },
  "isActive": true,
  "priority": 10
}
```

### Pre-built Automations

The system includes pre-built automations for:
- Prescription workflow
- Communication routing
- Patient follow-ups
- Compliance checks
- Report generation

## Automation Execution

### Manual Execution

```bash
POST /api/automations
{
  "automationId": "automation-id",
  "context": {
    "prescriptionId": "prescription-id"
  }
}
```

### Event Processing

Events are automatically processed:
```bash
POST /api/automations/events
{
  "eventType": "prescription.created",
  "eventData": {
    "prescriptionId": "prescription-id"
  }
}
```

## Execution Logs

All automation runs are logged in `automation_runs` table:
- Execution status
- Input data
- Output data
- Error messages
- Duration
- Timestamps

## Best Practices

1. **Idempotency**: Make actions idempotent
2. **Error Handling**: Implement retry logic
3. **Logging**: Log all executions
4. **Testing**: Test automations before activating
5. **Monitoring**: Monitor execution performance
6. **Priority**: Set appropriate priorities
7. **Conditions**: Use specific conditions to avoid unnecessary runs

## Examples

### Example 1: Auto-approve Low-Risk Prescriptions

```json
{
  "name": "Auto-approve Low-Risk",
  "trigger": {
    "type": "event",
    "config": {
      "eventType": "prescription.created"
    }
  },
  "action": {
    "type": "ai_agent",
    "config": {
      "agentRole": "pharmacist",
      "message": "Review prescription for auto-approval if low risk"
    }
  }
}
```

### Example 2: Daily Patient Follow-up

```json
{
  "name": "Daily Follow-up",
  "trigger": {
    "type": "schedule",
    "config": {
      "schedule": "daily",
      "hour": 10
    }
  },
  "action": {
    "type": "ai_agent",
    "config": {
      "agentRole": "nurse",
      "message": "Generate follow-up tasks for patients due today"
    }
  }
}
```

### Example 3: Urgent Communication Alert

```json
{
  "name": "Urgent Alert",
  "trigger": {
    "type": "condition",
    "config": {
      "field": "urgency",
      "operator": "equals",
      "value": "high"
    }
  },
  "action": {
    "type": "notification",
    "config": {
      "subject": "Urgent Communication",
      "message": "An urgent communication requires attention"
    }
  }
}
```
