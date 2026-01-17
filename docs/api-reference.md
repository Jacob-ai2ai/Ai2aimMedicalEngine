# API Reference

## Base URL

Development: `http://localhost:3000/api`
Production: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via Supabase session cookie.

## Endpoints

### Health Check

#### GET /api/health
Check API health status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-16T18:00:00.000Z",
  "version": "1.0.0"
}
```

### AI Agents

#### GET /api/ai/agents
Get all available AI agents.

**Response**:
```json
{
  "agents": [
    {
      "id": "agent-id",
      "name": "Pharmacist Agent",
      "role": "pharmacist",
      "agentType": "role_based",
      "description": "...",
      "capabilities": [...]
    }
  ]
}
```

#### POST /api/ai/agents
Process a message with an AI agent.

**Request**:
```json
{
  "agentId": "agent-id",
  "message": "Verify this prescription",
  "context": {
    "prescriptionId": "prescription-id"
  }
}
```

**Response**:
```json
{
  "response": {
    "role": "assistant",
    "content": "Agent response...",
    "timestamp": "2024-01-16T18:00:00.000Z"
  }
}
```

#### POST /api/ai/sessions
Create a new AI agent session.

**Request**:
```json
{
  "agentId": "agent-id",
  "context": {
    "patientId": "patient-id"
  }
}
```

**Response**:
```json
{
  "sessionId": "session-id"
}
```

#### GET /api/ai/sessions?sessionId=session-id
Get session state.

**Response**:
```json
{
  "state": {
    "id": "session-id",
    "agentId": "agent-id",
    "status": "idle",
    "context": {...},
    "messages": [...]
  }
}
```

### Automations

#### GET /api/automations
Get all automations.

**Response**:
```json
{
  "automations": [
    {
      "id": "automation-id",
      "name": "Automation Name",
      "trigger": {...},
      "action": {...},
      "isActive": true
    }
  ]
}
```

#### POST /api/automations
Execute an automation.

**Request**:
```json
{
  "automationId": "automation-id",
  "context": {
    "prescriptionId": "prescription-id"
  }
}
```

**Response**:
```json
{
  "run": {
    "id": "run-id",
    "status": "success",
    "outputData": {...}
  }
}
```

#### POST /api/automations/events
Process an automation event.

**Request**:
```json
{
  "eventType": "prescription.created",
  "eventData": {
    "prescriptionId": "prescription-id"
  }
}
```

**Response**:
```json
{
  "success": true,
  "received": true
}
```

### MCP Tools

#### GET /api/mcp/tools
List available MCP tools.

**Response**:
```json
{
  "tools": [
    {
      "name": "get_patient",
      "description": "Get patient information",
      "parameters": {...}
    }
  ],
  "count": 5
}
```

#### POST /api/mcp/tools
Execute an MCP tool.

**Request**:
```json
{
  "toolName": "get_patient",
  "arguments": {
    "patientId": "patient-id"
  }
}
```

**Response**:
```json
{
  "result": {
    "tool_call_id": "tool-call-id",
    "result": {...}
  }
}
```

### Robot API

#### GET /api/robot/status
Get robot status.

**Response**:
```json
{
  "status": "online",
  "capabilities": [...],
  "version": "1.0.0",
  "timestamp": "2024-01-16T18:00:00.000Z"
}
```

#### POST /api/robot/commands
Execute a robot command.

**Request**:
```json
{
  "command": "get_prescription",
  "parameters": {
    "prescriptionId": "prescription-id"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {...}
}
```

#### POST /api/robot/ai-agent
Process AI agent request from robot.

**Request**:
```json
{
  "agentRole": "pharmacist",
  "message": "Verify prescription",
  "context": {
    "prescriptionId": "prescription-id"
  }
}
```

**Response**:
```json
{
  "success": true,
  "response": "Agent response...",
  "agentRole": "pharmacist"
}
```

#### POST /api/robot/webhook
Receive webhook from robot.

**Request**:
```json
{
  "eventType": "prescription.filled",
  "eventData": {
    "prescriptionId": "prescription-id"
  },
  "robotId": "robot-id"
}
```

**Response**:
```json
{
  "success": true,
  "received": true
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Status Codes**:
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API rate limiting will be implemented in production. Current limits:
- 100 requests per minute per user
- 1000 requests per hour per user

## Webhooks

### Automation Webhooks

Endpoint: `/api/automations/webhook/{automation-id}`

**Request**:
```json
{
  "eventType": "custom.event",
  "eventData": {...}
}
```

### Robot Webhooks

Endpoint: `/api/robot/webhook`

**Request**:
```json
{
  "eventType": "robot.event",
  "eventData": {...},
  "robotId": "robot-id"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Create AI agent session
const response = await fetch('/api/ai/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'agent-id',
    context: { patientId: 'patient-id' }
  })
})
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/ai/agents',
    json={
        'agentId': 'agent-id',
        'message': 'Hello',
        'context': {}
    }
)
```

## Testing

Use the health endpoint to verify API is running:
```bash
curl http://localhost:3000/api/health
```
