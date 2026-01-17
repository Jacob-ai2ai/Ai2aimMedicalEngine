# Supabase Environment Variables Setup

## Required Variables

The following environment variables are **required** for the application to work:

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://avmoqiwlgkshdyrqxddl.supabase.co

# Supabase Anonymous/Public Key (for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ro_S5l7rALSCC4yoN68FoQ_Xr9qDpnm
```

## Optional Variables

```env
# Service Role Key (for admin/server operations)
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_ro_S5l7rALSCC4yoN68FoQ_Xr9qDpnm

# Database Password (if using local PostgreSQL)
SUPABASE_DB_PASSWORD=your-db-password
```

## Where to Get These Values

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Go to Project Settings → API**
4. **Copy**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon` `public` key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role` key** (optional) → `SUPABASE_SERVICE_ROLE_KEY`

## File Locations

### For Local Development (npm run dev)
- Use: `.env.local`
- This file is gitignored (secrets stay local)

### For Docker Development
- Use: `.env`
- Docker Compose reads from `.env` and `.env.local` (`.env.local` takes precedence)

## Verification

### Check if variables are loaded:

**Local:**
```bash
# Check .env.local exists and has values
cat .env.local | grep SUPABASE
```

**Docker:**
```bash
# Check variables in container
docker compose -f docker-compose.dev.yml exec app printenv | grep SUPABASE

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Test Connection:

```bash
# Health check
curl http://localhost:3000/api/health

# Should return: {"status":"healthy",...}
```

## Troubleshooting

**"Missing Supabase environment variables" error**
- Check `.env` or `.env.local` exists
- Verify variable names are correct (must start with `NEXT_PUBLIC_` for client-side)
- Restart dev server or Docker container after changing `.env`

**Docker not loading variables**
- Ensure `.env` file exists in project root
- Restart container: `docker compose -f docker-compose.dev.yml restart`
- Check: `docker compose -f docker-compose.dev.yml exec app printenv | grep SUPABASE`

**Connection errors**
- Verify Supabase project is active
- Check credentials are correct
- Ensure migrations have been run

## Security Notes

- ✅ `.env` and `.env.local` are in `.gitignore` (never committed)
- ✅ `.env.example` is committed (template only, no secrets)
- ⚠️ Never commit actual credentials to Git
- ⚠️ Service Role Key has admin access - keep it secret
