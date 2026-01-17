# AI2AIM RX Platform

A comprehensive medical RX management platform built with Next.js, React, TypeScript, Supabase, and AI agents.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)

## 🚀 Features

- **Medical Management**: Complete prescription, patient, and communication management
- **AI Agents**: Role-based AI agents (Pharmacist, Physician, Nurse, Admin, Billing, Compliance)
- **Encoding Agents**: AI agents for document processing (letters, referrals, communications)
- **Automation Engine**: Comprehensive automation system with triggers and actions
- **RAG Integration**: Retrieval-Augmented Generation for intelligent document search
- **MCP Tools**: Model Context Protocol integration for agent capabilities
- **Real-time Updates**: Live data synchronization using Supabase Realtime
- **Mobile-First**: Fully responsive design optimized for all devices
- **Builder.io Integration**: Visual page builder for UI/UX design
- **Robot API**: API endpoints and WebSocket support for future robot integration

## 📋 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **UI Components**: shadcn/ui, Radix UI, Builder.io
- **AI Framework**: Custom AI agent framework with RAG and MCP integration
- **Styling**: Tailwind CSS with custom medical theme

## 🏗️ Project Structure

```
ai2aimRX/
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/              # API endpoints
│   │   └── builder/          # Builder.io pages
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── medical/          # Medical components
│   │   ├── ai-agents/        # AI agent UI
│   │   ├── automations/     # Automation UI
│   │   └── builder/          # Builder.io components
│   ├── lib/                  # Business logic
│   │   ├── supabase/         # Supabase utilities
│   │   ├── ai/               # AI agent framework
│   │   ├── automations/      # Automation engine
│   │   ├── medical/          # Medical utilities
│   │   ├── robot/            # Robot integration
│   │   └── builder/          # Builder.io integration
│   ├── types/                # TypeScript types
│   └── hooks/                # React hooks
├── supabase/                 # Supabase config
│   ├── migrations/          # Database migrations
│   └── config.toml         # Supabase config
├── docs/                    # Documentation
├── jira/                    # Jira integration files
└── scripts/                 # Setup scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai2aimRX.git
   cd ai2aimRX
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # Builder.io
   NEXT_PUBLIC_BUILDER_API_KEY=your-builder-api-key
   
   # AI/LLM (Optional)
   GEMINI_API_KEY=your-gemini-key
   SERP_API_KEY=your-serp-key
   ```

4. **Set up Supabase:**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` in SQL Editor
   - Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Setup Guide](SETUP.md)** - Comprehensive setup instructions
- **[SRS Document](docs/SRS.md)** - Software Requirements Specification
- **[Use Cases & User Stories](docs/use-cases-and-user-stories.md)** - Detailed use cases
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Architecture](docs/architecture.md)** - System architecture
- **[Builder.io Setup](docs/builder-io-setup.md)** - Visual page builder guide

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run verify` - Verify project setup
- `npm run setup` - Run Supabase setup helper

### Code Organization

- Components in `src/components/`
- Business logic in `src/lib/`
- Types in `src/types/`
- Hooks in `src/hooks/`
- API routes in `src/app/api/`

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Verify setup
npm run verify
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

### Supported Platforms

- Vercel (Recommended)
- Netlify
- AWS
- Docker

## 🔐 Security

- Row Level Security (RLS) policies on all tables
- Role-based access control (RBAC)
- Environment variables for sensitive data
- HTTPS encryption
- HIPAA compliance considerations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Private - All rights reserved

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn/ui for the component library
- Builder.io for visual page building

## 📞 Support

For issues and questions:
1. Check the [documentation](docs/)
2. Review [troubleshooting guides](SETUP.md#troubleshooting)
3. Open an issue on GitHub

---

**Built with ❤️ for medical professionals**
