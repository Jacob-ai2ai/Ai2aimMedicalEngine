# Team Setup Guide - AI2AIM RX Platform

**Quick checklist for new team members to get the project running locally.**

## ✅ Prerequisites Checklist

- [ ] **Node.js 20+** installed (use `.nvmrc` if you have nvm: `nvm use`)
- [ ] **Docker Desktop** (optional, for containerized setup)
- [ ] **Supabase account** (free tier works)
- [ ] **Git** installed

## 🚀 Quick Start (Choose One)

### Option 1: Docker (Recommended - Full Reproducibility)

```bash
# 1. Clone repository
git clone <repository-url>
cd ai2aimRX

# 2. Set up environment
cp .env.example .env
# Edit .env and add your Supabase credentials

# 3. Start with Docker
docker compose -f docker-compose.dev.yml up --build
```

**Access**: http://localhost:3000

### Option 2: Local Development

```bash
# 1. Clone repository
git clone <repository-url>
cd ai2aimRX

# 2. Install Node.js version (if using nvm)
nvm use  # Uses .nvmrc

# 3. Install dependencies
npm install

# 4. Set up environment
cp .env.example .env
# Edit .env and add your Supabase credentials

# 5. Run database migrations (see below)

# 6. Start dev server
npm run dev
```

**Access**: http://localhost:3000

## 📋 Required Setup Steps

### 1. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Get credentials from**: Supabase Dashboard → Project Settings → API

### 2. Database Migrations

#### Option A: Supabase Dashboard (Easiest)
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_ai_agents_data.sql`
   - `supabase/migrations/003_comprehensive_rls_policies.sql`
   - `supabase/migrations/004_rag_functions.sql`
   - `supabase/migrations/005_legacy_parity_tables.sql`
   - `supabase/migrations/006_encounters_and_followups.sql`
   - `supabase/migrations/007_aeterna_runtime_v2.sql`
   - `supabase/migrations/007_sleep_clinic_dme.sql`
   - `supabase/migrations/008_aeterna_agents_seed.sql`
   - `supabase/migrations/008_staff_scheduling.sql`
   - `supabase/migrations/009_pft_locations_referrals.sql`

#### Option B: Supabase CLI
```bash
# Install CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Enable Extensions

In Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Create First User

1. Supabase Dashboard → Authentication → Users → "Add user"
2. Create user with email/password
3. Copy user ID (UUID)
4. In SQL Editor:
```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES ('user-uuid-here', 'admin@example.com', 'Admin User', 'admin');
```

## ✅ Verification

- [ ] Dependencies installed (`npm install` completed)
- [ ] Environment variables set (`.env` file exists with credentials)
- [ ] Database migrations run (check Supabase Dashboard → Database → Tables)
- [ ] First user created (can log in at http://localhost:3000/login)
- [ ] Dev server running (http://localhost:3000 loads)

## 📚 Additional Resources

- **Detailed Setup**: See [SETUP.md](./SETUP.md)
- **Quick Start**: See [QUICK_START.md](./QUICK_START.md)
- **Docker Setup**: See [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🆘 Common Issues

**"Missing Supabase environment variables"**
- Check `.env` file exists and has correct variable names (must start with `NEXT_PUBLIC_`)

**Port 3000 already in use**
- Change port: `PORT=3001 npm run dev`
- Or kill existing process: `lsof -ti:3000 | xargs kill`

**Database connection errors**
- Verify Supabase project is active
- Check credentials in `.env`
- Ensure migrations have been run

**Node version mismatch**
- Use nvm: `nvm use` (reads `.nvmrc`)
- Or install Node.js 20+ manually

## 📝 Notes

- `.env` is gitignored (never commit secrets)
- `package-lock.json` is committed (ensures consistent dependencies)
- Docker setup includes hot reload for development
- All migrations are in `supabase/migrations/` directory
