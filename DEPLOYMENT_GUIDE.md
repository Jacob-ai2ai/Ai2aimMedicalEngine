# AI2AIM RX - Complete Deployment Guide

This guide will walk you through deploying the AI2AIM RX platform from development to production.

## 📋 Pre-Deployment Checklist

### 1. Security Verification
```bash
# Run security verification
npm run verify:security

# Should show 100% (20/22 checks passing)
# Fix any issues before proceeding
```

### 2. Code Quality Checks
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### 3. Build Test
```bash
# Test production build
npm run build

# Should complete without errors
```

---

## 🔧 Environment Setup

### Development Environment

1. **Copy environment template**:
```bash
cp .env.local.example .env.local
```

2. **Generate security secrets**:
```bash
# Generate CSRF secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

3. **Configure `.env.local`**:
```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security (REQUIRED)
CSRF_SECRET=your-generated-csrf-secret
SESSION_SECRET=your-generated-session-secret

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Environment

All production environment variables should be set in your hosting platform (Vercel, Netlify, etc.).

**Additional production requirements**:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Production rate limiting (recommended)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Error tracking (recommended)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Email/SMS (optional)
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

---

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize
4. Copy project URL and API keys

### 2. Run Migrations

#### Option A: Supabase Dashboard (Recommended)

1. Go to SQL Editor in Supabase Dashboard
2. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_ai_agents_data.sql`
   - `supabase/migrations/003_comprehensive_rls_policies.sql`

#### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Verify Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Should return all your tables

-- Check policies exist
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public';

-- Should return 40+ policies

-- Check audit log table exists
SELECT COUNT(*) FROM public.audit_logs;

-- Should return 0 (empty but exists)
```

### 4. Create Initial Admin User

```sql
-- After first user signs up, make them admin
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

---

## ☁️ Deployment Options

### Option 1: Vercel (Recommended)

#### Setup

1. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

2. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Select framework preset: "Next.js"

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local.example`
   - Make sure to set `NODE_ENV=production`

4. **Deploy**:
```bash
# Via CLI
vercel --prod

# Or push to main branch (auto-deploys)
git push origin main
```

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Option 2: Netlify

1. **Connect Repository**:
   - Go to [netlify.com](https://netlify.com)
   - Import Git repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add all production variables

4. **Deploy**:
```bash
# Via CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Docker

#### Build Docker Image

```bash
# Build
docker build -t ai2aimrx:latest .

# Run locally
docker run -p 3000:3000 --env-file .env.local ai2aimrx:latest
```

#### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 4: AWS (Advanced)

See `DEPLOYMENT.md` for detailed AWS deployment instructions.

---

## 🔒 Security Configuration

### 1. SSL/HTTPS

**Vercel/Netlify**: Automatic SSL certificates

**Custom Domain**:
1. Add custom domain in hosting platform
2. Update DNS records (CNAME or A record)
3. Wait for SSL certificate provisioning

### 2. Rate Limiting (Production)

Set up Upstash Redis:

1. Go to [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST URL and token
4. Add to environment variables:
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 3. Error Tracking

Set up Sentry:

1. Go to [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Copy DSN
4. Add to environment variables:
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn
```

### 4. Security Headers Verification

Test your deployed site:
```bash
curl -I https://yourdomain.com
```

Should include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (production only)
- `Content-Security-Policy`

---

## 🧪 Post-Deployment Testing

### 1. Automated Tests

```bash
# Run all checks
npm run verify:security

# Should show 100% pass rate
```

### 2. Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Login works
- [ ] User can sign up
- [ ] Dashboard loads with data
- [ ] Create patient works
- [ ] Create prescription works
- [ ] CSRF protection works (POST without token fails)
- [ ] Rate limiting works (101 requests triggers 429)
- [ ] Unauthorized access blocked
- [ ] RLS policies enforced (users see only their data)
- [ ] Audit logs created
- [ ] Real-time updates work

### 3. Security Testing

```bash
# Test rate limiting
for i in {1..101}; do
  curl https://yourdomain.com/api/health
done
# Last request should return 429

# Test CSRF protection
curl -X POST https://yourdomain.com/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test"}'
# Should return 403 Forbidden

# Test security headers
curl -I https://yourdomain.com
# Should show all security headers
```

### 4. Performance Testing

Use Lighthouse:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://yourdomain.com --view
```

Target scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 95+
- SEO: 90+

---

## 📊 Monitoring Setup

### 1. Vercel Analytics (if using Vercel)

```bash
npm install @vercel/analytics
```

Add to `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Sentry Integration

Create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

### 3. Uptime Monitoring

Set up external monitoring:
- [Better Uptime](https://betteruptime.com)
- [Pingdom](https://pingdom.com)
- [UptimeRobot](https://uptimerobot.com)

Configure:
- Check interval: 5 minutes
- Locations: Multiple regions
- Alerts: Email, SMS, Slack

### 4. Database Monitoring

In Supabase Dashboard:
- Enable Database Stats
- Set up email alerts for:
  - High CPU usage (>80%)
  - High memory usage (>80%)
  - Connection pool saturation (>90%)

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint
        
      - name: Security verification
        run: npm run verify:security
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🗺️ Domain & DNS Setup

### 1. Add Custom Domain

**Vercel**:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown

**Netlify**:
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records

### 2. DNS Configuration

If using your own DNS:

```
# A Record
Type: A
Name: @
Value: [hosting-ip]

# CNAME Record  
Type: CNAME
Name: www
Value: [hosting-domain]

# Optional: Email
Type: MX
Priority: 10
Value: [mail-server]
```

### 3. SSL Certificate

Both Vercel and Netlify auto-provision SSL via Let's Encrypt.

Verify SSL:
```bash
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

---

## 📝 Backup Strategy

### 1. Database Backups

Supabase provides automatic backups, but also set up custom backups:

```bash
# Manual backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-YYYYMMDD.sql
```

### 2. Code Backups

- **Primary**: Git repository (GitHub, GitLab, Bitbucket)
- **Secondary**: Regular local clones
- **Tertiary**: Automated Git backups

### 3. Environment Variables

Store encrypted backups of all environment variables:

```bash
# Export all env vars
cat .env.local | gpg --encrypt > env.backup.gpg

# Decrypt when needed
gpg --decrypt env.backup.gpg > .env.local
```

---

## 🚨 Incident Response

### Common Issues

#### 1. Site Down
```bash
# Check hosting status
# Check Supabase status
# Check error logs in Sentry
# Check rate limiting (might be blocking traffic)
```

#### 2. Database Connection Issues
```sql
-- Check active connections
SELECT COUNT(*) FROM pg_stat_activity;

-- Kill long-running queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 minutes';
```

#### 3. Rate Limit Issues
```bash
# Temporarily increase limit in middleware.ts
uniqueTokenPerInterval: 200 // from 100

# Or whitelist specific IPs
# Add to middleware logic
```

---

## 📈 Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 500ms (p95)
- CPU usage > 70%
- Memory usage > 80%
- Database connections > 80%
- Error rate > 1%

### Horizontal Scaling

Vercel/Netlify auto-scale, but for custom hosting:

1. **Load Balancer**: Distribute traffic
2. **Multiple Instances**: Run multiple app instances
3. **CDN**: CloudFlare, Fastly
4. **Database Read Replicas**: Supabase Pro plan

### Vertical Scaling

1. **Upgrade hosting plan**: More CPU/RAM
2. **Upgrade database**: Supabase Pro/Team plan
3. **Optimize queries**: Add indexes, use caching

---

## ✅ Go-Live Checklist

### Pre-Launch (24 hours before)
- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] SSL certificate active
- [ ] Security verification: 100%
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Incident response plan ready

### Launch Day
- [ ] DNS propagation complete
- [ ] All pages loading correctly
- [ ] Authentication working
- [ ] Email/SMS notifications working
- [ ] Error tracking active
- [ ] Uptime monitoring active
- [ ] Team notified

### Post-Launch (First Week)
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Check audit logs daily
- [ ] Review security alerts
- [ ] Database backup verified
- [ ] User feedback collected

---

## 🎓 Training & Documentation

### For Developers
- [ ] Review `SECURITY_IMPLEMENTATION.md`
- [ ] Review `plans/innovation-and-fixes-plan.md`
- [ ] Review API route examples
- [ ] Understand RLS policies

### For Administrators
- [ ] User management procedures
- [ ] Security incident response
- [ ] Backup and recovery procedures
- [ ] Monitoring dashboard access

### For End Users
- [ ] User guide (to be created)
- [ ] Video tutorials (to be created)
- [ ] FAQ documentation
- [ ] Support contact info

---

## 📞 Support & Maintenance

### Regular Maintenance
- **Daily**: Check error logs, monitor uptime
- **Weekly**: Review security alerts, check backups
- **Monthly**: Update dependencies, review performance
- **Quarterly**: Security audit, load testing

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```

### Security Updates
- Subscribe to security advisories
- Monitor Dependabot alerts (GitHub)
- Review Snyk reports
- Apply critical patches immediately

---

## 🎉 Success Metrics

Track these KPIs:

**Technical**:
- Uptime: >99.9%
- Response time: <200ms (p95)
- Error rate: <0.1%
- Security score: 100%

**Business**:
- User adoption rate
- Feature usage
- Support tickets
- User satisfaction (NPS)

**Compliance**:
- Audit log completeness: 100%
- RLS policy coverage: 100%
- HIPAA compliance: Verified
- Security incidents: 0

---

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Best Practices](https://vercel.com/docs/concepts/deployments/overview)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/for-professionals/index.html)

---

**Last Updated**: January 2026  
**Status**: Production Ready  
**Next Review**: Monthly
