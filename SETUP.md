# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- (Optional) OpenAI or Anthropic API key for LLM features

## Step 1: Install Dependencies

Dependencies have been installed. If you need to reinstall:

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `ai2aimrx` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
5. Wait for project to be created (takes ~2 minutes)

### 2.2 Get Supabase Credentials

1. Go to Project Settings → API
2. Copy the following:
   - Project URL (under "Project URL")
   - `anon` `public` key (under "Project API keys")
   - `service_role` key (under "Project API keys" - keep this secret!)

### 2.3 Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI/LLM (Optional - for AI agent features)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# MCP Server (Optional)
MCP_SERVER_URL=http://localhost:3001
```

### 2.4 Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_ai_agents_data.sql`
   - `supabase/migrations/004_rag_functions.sql`

### 2.5 Enable Extensions

In Supabase SQL Editor, run:

```sql
-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step 3: Configure AI Services (Optional)

### 3.1 OpenAI Setup

1. Get API key from [https://platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### 3.2 Anthropic Setup

1. Get API key from [https://console.anthropic.com](https://console.anthropic.com)
2. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

### 3.3 Update AI Agent Implementation

Edit `src/lib/ai/base-agent.ts` to use actual LLM APIs instead of placeholder.

## Step 4: Set Up MCP Server (Optional)

If you want to use MCP tools:

1. Set up an MCP server (separate service)
2. Update `MCP_SERVER_URL` in `.env.local`
3. Ensure MCP server implements the expected tool interface

## Step 5: Create Initial User

### Option A: Using Supabase Dashboard

1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Set email and password
4. Note the user ID

### Option B: Using SQL

```sql
-- Create user in auth.users (via Supabase Auth)
-- Then create profile:
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'user-uuid-here',
  'admin@example.com',
  'Admin User',
  'admin'
);
```

## Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: Verify Installation

1. **Health Check**: Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - Should return: `{"status":"healthy",...}`

2. **Login**: Go to [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
   - Use the credentials you created in Step 5

3. **Dashboard**: After login, you should see the dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Troubleshooting

### Database Connection Issues

- Verify `.env.local` has correct Supabase URL and keys
- Check Supabase project is active
- Ensure migrations have been run

### TypeScript Errors

- Run `npm run type-check` to see all errors
- Ensure all dependencies are installed: `npm install`

### Build Errors

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Authentication Issues

- Check Supabase Auth settings
- Verify email confirmation is disabled for development (or confirm email)
- Check RLS policies are correctly set

### Real-time Not Working

- Ensure Supabase Realtime is enabled in project settings
- Check Realtime settings in Supabase dashboard

## Next Steps

1. **Add Sample Data**: Create test patients, prescriptions, etc.
2. **Configure AI Agents**: Set up LLM integration for AI agents
3. **Set Up Automations**: Create automation workflows
4. **Customize UI**: Adjust colors, branding, etc.
5. **Deploy**: Prepare for production deployment

## Production Deployment

### Environment Variables

Ensure all environment variables are set in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Other: Follow platform-specific instructions

### Database

- Use production Supabase project
- Run migrations on production database
- Set up database backups

### Security

- Never commit `.env.local` or `.env` files
- Use service role key only on server-side
- Enable RLS policies for all tables
- Set up proper CORS policies
