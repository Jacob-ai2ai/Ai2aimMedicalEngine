# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied to production
- [ ] Production Supabase project created
- [ ] RLS policies reviewed and tested
- [ ] API keys secured
- [ ] Build passes: `npm run build`
- [ ] Type checking passes: `npm run type-check`

## Deployment Options

### Vercel (Recommended for Next.js)

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Import project in Vercel

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY` (if using)
     - `ANTHROPIC_API_KEY` (if using)
     - `MCP_SERVER_URL` (if using)

3. **Deploy**
   - Vercel will auto-detect Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

4. **Post-Deployment**
   - Update Supabase Auth redirect URLs
   - Test all features
   - Monitor logs

### Netlify

1. **Connect Repository**
   - Push to Git
   - Import in Netlify

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Site Settings → Environment Variables
   - Add all required variables

### Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Update `next.config.js`:
```js
module.exports = {
  output: 'standalone',
  // ... rest of config
}
```

## Environment Variables for Production

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

### Optional
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `MCP_SERVER_URL`

## Security Checklist

- [ ] Never commit `.env.local` or `.env` files
- [ ] Use service role key only server-side
- [ ] Enable RLS on all tables
- [ ] Review and test RLS policies
- [ ] Set up proper CORS policies
- [ ] Enable Supabase Auth email confirmations in production
- [ ] Set up database backups
- [ ] Monitor API usage and costs
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable HTTPS only

## Post-Deployment

1. **Update Supabase Auth Settings**
   - Add production URL to allowed redirect URLs
   - Configure email templates
   - Set up email provider (if using custom)

2. **Test All Features**
   - Authentication flow
   - CRUD operations
   - AI agent interactions
   - Automations
   - Real-time updates

3. **Monitor**
   - Application logs
   - Database performance
   - API usage
   - Error rates

4. **Optimize**
   - Enable Next.js Image Optimization
   - Set up CDN for static assets
   - Configure caching strategies
   - Optimize database queries

## Rollback Plan

1. Keep previous deployment version
2. Document database migration rollback steps
3. Have backup of environment variables
4. Test rollback procedure in staging
