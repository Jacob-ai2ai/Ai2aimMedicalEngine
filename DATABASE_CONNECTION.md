# Database Connection Information

## PostgreSQL Connection String

Your Supabase PostgreSQL database connection string:

```
postgresql://postgres:Business123$%^&**(@db.avmoqiwlgkshdyrqxddl.supabase.co:5432/postgres
```

## Connection Details

- **Host**: `db.avmoqiwlgkshdyrqxddl.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `Business123$%^&**(`

## Environment Variables

The connection string has been saved to `.env.local` as:
- `DATABASE_URL` - Direct PostgreSQL connection string

## Usage

### Using psql CLI
```bash
psql "postgresql://postgres:Business123$%^&**(@db.avmoqiwlgkshdyrqxddl.supabase.co:5432/postgres"
```

### Using Supabase Client (Recommended)
For application use, prefer the Supabase client with these variables:
- `NEXT_PUBLIC_SUPABASE_URL` - https://avmoqiwlgkshdyrqxddl.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - sb_publishable_ro_S5l7rALSCC4yoN68FoQ_Xr9qDpnm

### Using pgAdmin or Other Tools
1. **Host**: `db.avmoqiwlgkshdyrqxddl.supabase.co`
2. **Port**: `5432`
3. **Database**: `postgres`
4. **Username**: `postgres`
5. **Password**: `Business123$%^&**(`

## Security Notes

⚠️ **Important Security Reminders:**
- The `DATABASE_URL` contains your database password
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Never share this connection string publicly
- Use the Supabase client for application connections (more secure)
- The direct PostgreSQL connection is for migrations and admin tasks

## When to Use Each Connection Method

### Use Supabase Client (Recommended for App)
- ✅ Application code
- ✅ API routes
- ✅ Server-side operations
- ✅ Automatic connection pooling
- ✅ Built-in authentication

### Use Direct PostgreSQL Connection
- ✅ Database migrations
- ✅ CLI tools (psql, pg_dump, etc.)
- ✅ Database administration
- ✅ Direct SQL queries
- ⚠️ Bypasses Supabase features (auth, RLS, etc.)

## Connection Pooling

Supabase provides connection pooling. For production:
- Use Supabase client for application connections
- Use direct connection only for admin/migration tasks
- Consider using Supabase connection pooler if needed

## Troubleshooting

### Connection Refused
- Check if your IP is allowed in Supabase Dashboard
- Verify firewall settings
- Check Supabase project status

### Authentication Failed
- Verify password is correct
- Check username (should be `postgres`)
- Ensure database name is `postgres`

### SSL Required
Some tools may require SSL. Add `?sslmode=require`:
```
postgresql://postgres:Business123$%^&**(@db.avmoqiwlgkshdyrqxddl.supabase.co:5432/postgres?sslmode=require
```

---

**Connection string saved to `.env.local` as `DATABASE_URL`**
