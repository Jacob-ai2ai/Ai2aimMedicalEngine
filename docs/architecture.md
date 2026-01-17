# Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Pages   │  │Components│  │  Hooks   │  │  Types   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   AI     │  │Automation│  │   MCP    │  │  Robot   │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   AI     │  │Automation│  │   RAG    │  │  Medical │  │
│  │ Framework│  │  Engine   │  │  System  │  │  Utils   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Auth │  │ Realtime │  │ Storage │  │
│  │Database │  │       │  │          │  │         │  │
│  └──────────┘  └───────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### Layout Components
- `Sidebar` - Desktop navigation
- `MobileNav` - Mobile bottom navigation
- `DashboardLayout` - Protected route wrapper

#### Medical Components
- `RealtimePrescriptions` - Live prescription updates
- `RealtimeCommunications` - Live communication updates

#### UI Components (shadcn/ui)
- `Button` - Reusable button component
- `Card` - Card container component

### Backend Architecture

#### AI Agent Framework

```
BaseAgent (Abstract)
├── Role-Based Agents
│   ├── PharmacistAgent
│   ├── PhysicianAgent
│   ├── AdministrativeAgent
│   ├── NurseAgent
│   ├── BillingAgent
│   └── ComplianceAgent
└── Encoding Agents
    ├── LetterEncodingAgent
    ├── ReferralEncodingAgent
    ├── CommunicationEncodingAgent
    └── DocumentEncodingAgent
```

#### Automation System

```
AutomationEngine
├── TriggerSystem
│   ├── Event Triggers
│   ├── Schedule Triggers
│   ├── Condition Triggers
│   └── Webhook Triggers
└── ActionSystem
    ├── Notification Actions
    ├── Task Actions
    ├── API Call Actions
    ├── AI Agent Actions
    └── Workflow Actions
```

#### RAG System

```
VectorStore
├── Document Ingestion
├── Embedding Generation
└── Similarity Search

SemanticSearch
├── Query Processing
├── Context Retrieval
└── Filtered Search
```

## Data Flow

### Authentication Flow

```
User → Login Page → Supabase Auth → Middleware → Dashboard
```

### Prescription Flow

```
User → Prescription Form → API Route → Supabase → Database
                                    ↓
                              Realtime Update → UI
```

### AI Agent Flow

```
User Request → API Route → Agent Orchestrator → Agent Registry
                                              ↓
                                        Base Agent
                                              ↓
                                    LLM Call (placeholder)
                                              ↓
                                        Response → User
```

### Automation Flow

```
Event → Trigger System → Check Conditions → Execute Action
                                              ↓
                                        Update Database
                                              ↓
                                        Log Execution
```

## Database Schema

### Core Tables

- `user_profiles` - User account information
- `patients` - Patient records
- `prescriptions` - RX prescriptions
- `medications` - Medication database
- `communications` - Letters, messages, referrals

### AI Tables

- `ai_agents` - Agent configurations
- `ai_sessions` - Agent interaction sessions
- `rag_documents` - RAG document store with embeddings

### Automation Tables

- `automations` - Automation definitions
- `automation_runs` - Execution logs

## Security Architecture

### Authentication
- Supabase Auth for user authentication
- JWT tokens for session management
- Protected routes via middleware

### Authorization
- Role-based access control (RBAC)
- Permission system
- Row Level Security (RLS) policies

### Data Protection
- Environment variables for secrets
- Service role key only server-side
- Input validation
- SQL injection prevention (Supabase handles)

## Scalability Considerations

### Frontend
- Next.js App Router for optimal performance
- Server Components for reduced client bundle
- Code splitting automatic
- Image optimization built-in

### Backend
- Supabase scales automatically
- Edge Functions for serverless compute
- Connection pooling
- Read replicas available

### Database
- PostgreSQL with pgvector
- Indexed queries
- Efficient RLS policies
- Connection pooling

## Integration Points

### External Services
- Supabase (Database, Auth, Storage, Realtime)
- LLM APIs (OpenAI, Anthropic) - To be configured
- MCP Server - To be configured

### Robot Integration
- REST API endpoints
- WebSocket support
- Real-time channels
- Command interface

## Performance Optimizations

1. **Database**
   - Indexed columns
   - Efficient queries
   - Connection pooling

2. **Frontend**
   - Server Components
   - Code splitting
   - Image optimization
   - Caching strategies

3. **Real-time**
   - Selective subscriptions
   - Efficient channel management
   - Connection reuse

## Future Enhancements

1. **Caching Layer**
   - Redis for session caching
   - CDN for static assets

2. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

4. **CI/CD**
   - Automated testing
   - Deployment pipelines
   - Environment management
