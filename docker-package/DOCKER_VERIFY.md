# Docker Connection Verification Guide

## Quick Verification Steps

### 1. Check if Container is Running

```bash
# Check all containers
docker ps

# Check specific project containers
docker compose -f docker-compose.dev.yml ps

# Should show:
# NAME                IMAGE               STATUS
# ai2aim-rx-dev       ai2aimrx-app        Up X minutes
```

### 2. Verify Container is Accessible

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Should return: {"status":"healthy",...}

# Or open in browser
open http://localhost:3000
```

### 3. Check Container Logs

```bash
# View recent logs
docker compose -f docker-compose.dev.yml logs --tail=50 app

# Follow logs in real-time
docker compose -f docker-compose.dev.yml logs -f app

# Look for:
# - "Ready in X ms" (Next.js started)
# - "Local: http://localhost:3000" (server running)
# - No error messages
```

### 4. Verify Environment Variables

```bash
# Check environment variables in container
docker compose -f docker-compose.dev.yml exec app env | grep SUPABASE

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. Check Volume Mounts (Hot Reload)

```bash
# Verify source code is mounted
docker compose -f docker-compose.dev.yml exec app ls -la /app/src

# Make a test change to a file, should see reload in logs
```

### 6. Verify Network Connection

```bash
# Check if container can reach Supabase
docker compose -f docker-compose.dev.yml exec app curl -I https://your-project.supabase.co

# Should return HTTP 200 or 404 (not connection refused)
```

## Common Issues & Solutions

### Container Not Running

```bash
# Start it
docker compose -f docker-compose.dev.yml up -d

# Check why it stopped
docker compose -f docker-compose.dev.yml logs app
```

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill existing process or change port in docker-compose.dev.yml
```

### Environment Variables Not Loading

```bash
# Verify .env file exists
ls -la .env

# Check if variables are in container
docker compose -f docker-compose.dev.yml exec app printenv | grep SUPABASE
```

### Build Errors

```bash
# Rebuild from scratch
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up
```

## Verification Checklist

- [ ] Container is running (`docker ps` shows it)
- [ ] Health endpoint responds (`curl http://localhost:3000/api/health`)
- [ ] Browser shows app at http://localhost:3000
- [ ] Logs show "Ready" message
- [ ] Environment variables are loaded (check with `exec app env`)
- [ ] Hot reload works (edit file, see changes)
- [ ] Can connect to Supabase (no connection errors in logs)

## Quick Test Script

```bash
#!/bin/bash
echo "🔍 Docker Connection Verification"
echo "================================"

# Check container status
echo "1. Container Status:"
docker compose -f docker-compose.dev.yml ps

# Check health
echo -e "\n2. Health Check:"
curl -s http://localhost:3000/api/health | jq . || echo "❌ Not responding"

# Check env vars
echo -e "\n3. Environment Variables:"
docker compose -f docker-compose.dev.yml exec app env | grep SUPABASE | head -2

# Check logs
echo -e "\n4. Recent Logs:"
docker compose -f docker-compose.dev.yml logs --tail=5 app
```

Save as `verify-docker.sh`, make executable: `chmod +x verify-docker.sh`, then run: `./verify-docker.sh`
