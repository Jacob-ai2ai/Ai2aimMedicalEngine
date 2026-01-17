# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies (Already Done ✅)
```bash
npm install
```

### 2. Set Up Supabase

#### Create Project
1. Visit [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Fill in details and wait for creation (~2 min)

#### Get Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep secret!)

#### Create Environment File
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Run Database Migrations

#### Using Supabase Dashboard (Easiest)
1. Go to SQL Editor in Supabase dashboard
2. Copy and run each file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_ai_agents_data.sql`
   - `supabase/migrations/004_rag_functions.sql`

#### Enable pgvector Extension
In SQL Editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Create First User

In Supabase Dashboard:
1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Set email: `admin@example.com` and password
4. Copy the user ID (UUID)

Then in SQL Editor, run:
```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'paste-user-id-here',
  'admin@example.com',
  'Admin User',
  'admin'
);
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Access Application

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Dashboard**: http://localhost:3000/dashboard (after login)

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Environment variables set in `.env.local`
- [ ] Database migrations run
- [ ] pgvector extension enabled
- [ ] First user created
- [ ] Development server running
- [ ] Can log in and see dashboard

## 🎯 Next Steps

1. **Add Sample Data**: Create test patients and prescriptions
2. **Configure AI**: Add OpenAI/Anthropic API keys for AI agents
3. **Test Features**: Try creating prescriptions, patients, communications
4. **Set Up Automations**: Create automation workflows
5. **Customize**: Adjust branding, colors, etc.

## 🆘 Troubleshooting

**"supabaseUrl is required" error**
- Check `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`

**Database connection errors**
- Verify Supabase project is active
- Check credentials are correct
- Ensure migrations have been run

**TypeScript errors**
- Run `npm run type-check` to see all errors
- Ensure all files are saved

**Build errors**
- Clear cache: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

## 📚 Full Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions.
