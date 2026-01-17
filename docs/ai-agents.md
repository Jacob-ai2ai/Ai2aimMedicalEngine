# AI Agents Documentation

## Overview

The AI2AIM RX platform includes a comprehensive AI agent framework with role-based agents and encoding agents for various medical and administrative tasks.

## Agent Types

### Role-Based Agents

These agents are specialized for specific medical roles:

#### 1. Pharmacist Agent
- **Purpose**: Prescription verification, drug interactions, medication counseling
- **Capabilities**:
  - Prescription verification
  - Drug interaction checking
  - Medication counseling
  - Dosage verification
- **Use Cases**:
  - Verify new prescriptions
  - Check for drug interactions
  - Provide medication information
  - Validate dosages

#### 2. Physician Agent
- **Purpose**: Prescription authorization, patient review, clinical decision support
- **Capabilities**:
  - Prescription authorization
  - Patient case review
  - Clinical decision support
  - Diagnosis assistance
- **Use Cases**:
  - Authorize prescriptions
  - Review patient cases
  - Provide clinical guidance
  - Assist with diagnoses

#### 3. Administrative Agent
- **Purpose**: Administrative tasks, scheduling, document processing
- **Capabilities**:
  - Document processing
  - Schedule management
  - Communication coordination
  - Data entry assistance
- **Use Cases**:
  - Process documents
  - Manage schedules
  - Coordinate communications
  - Assist with data entry

#### 4. Nurse Agent
- **Purpose**: Patient care coordination, follow-ups, care planning
- **Capabilities**:
  - Care coordination
  - Patient follow-ups
  - Care planning assistance
  - Patient education
- **Use Cases**:
  - Coordinate patient care
  - Conduct follow-ups
  - Assist with care planning
  - Provide patient education

#### 5. Billing Agent
- **Purpose**: Insurance processing, billing, payment management
- **Capabilities**:
  - Insurance verification
  - Claim processing
  - Billing management
  - Payment processing
- **Use Cases**:
  - Verify insurance
  - Process claims
  - Manage billing
  - Handle payments

#### 6. Compliance Agent
- **Purpose**: Regulatory compliance, audits, quality assurance
- **Capabilities**:
  - Regulatory compliance
  - Audit conduct
  - Quality monitoring
  - Compliance reporting
- **Use Cases**:
  - Ensure compliance
  - Conduct audits
  - Monitor quality
  - Generate reports

### Encoding Agents

These agents extract and structure data from documents:

#### 1. Letter Encoding Agent
- **Purpose**: Process inbound/outbound letters
- **Extracts**:
  - Direction (inbound/outbound)
  - Subject
  - Sender/Recipient
  - Date
  - Key points
  - Urgency level
  - Category

#### 2. Referral Encoding Agent
- **Purpose**: Process referral documents
- **Extracts**:
  - Referring provider
  - Receiving provider
  - Patient information
  - Reason for referral
  - Urgency
  - Specialty

#### 3. Communication Encoding Agent
- **Purpose**: Categorize and encode communications
- **Extracts**:
  - Communication category
  - Urgency assessment
  - Key information
  - Response requirements
  - Suggested recipient

#### 4. Document Encoding Agent
- **Purpose**: Extract structured data from various documents
- **Extracts**:
  - Document type
  - Document fields
  - Confidence score
  - Quality assessment

## Agent Framework

### Base Agent Class

All agents extend `BaseAgent` which provides:
- Session management
- State management
- Message handling
- Tool execution
- Error handling

### Agent Registry

The `AgentRegistry` manages:
- Agent registration
- Agent lookup
- Role-based routing
- Agent lifecycle

### Agent Orchestrator

The `AgentOrchestrator` handles:
- Request routing
- Session creation
- Multi-agent coordination
- Context management

## Usage

### Creating an Agent Session

```typescript
const sessionId = await agentOrchestrator.createSession(agentId, {
  userId: user.id,
  patientId: patient.id,
  prescriptionId: prescription.id
})
```

### Processing a Message

```typescript
const response = await agentOrchestrator.processMessage(sessionId, "Check this prescription")
```

### Using via API

```bash
POST /api/ai/agents
{
  "agentId": "pharmacist-agent-id",
  "message": "Verify this prescription",
  "context": {
    "prescriptionId": "prescription-id"
  }
}
```

## Integration with RAG

Agents can use RAG for context:
- Document retrieval
- Semantic search
- Context injection
- Knowledge base queries

## Integration with MCP Tools

Agents can execute tools via MCP:
- Database queries
- API calls
- System operations
- Custom tools

## Configuration

Agents are configured in the database (`ai_agents` table):
- System prompts
- Capabilities
- Configuration parameters
- Active status

## Best Practices

1. **Context**: Always provide relevant context
2. **Error Handling**: Implement proper error handling
3. **Logging**: Log all agent interactions
4. **Security**: Validate all inputs
5. **Performance**: Cache agent responses when appropriate
