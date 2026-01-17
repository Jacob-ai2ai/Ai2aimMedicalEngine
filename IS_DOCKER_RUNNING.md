# How to Know if Docker is Running Your App

## Quick Check

### Method 1: Check Running Containers
```bash
docker compose -f docker-compose.dev.yml ps
```

**If Docker is running:**
```
NAME            IMAGE           STATUS          PORTS
ai2aim-rx-dev   ai2aimrx-app    Up X minutes    0.0.0.0:3000->3000/tcp
```

**If NOT in Docker:**
```
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS
(empty - no containers)
```

### Method 2: Check What's Using Port 3000
```bash
# See what process is using port 3000
lsof -i :3000
```

**If Docker:**
```
COMMAND   PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node     1234  root   23u  IPv4  ...  TCP *:3000 (LISTEN)
```

**If Local npm:**
```
COMMAND   PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node     5678  jacob  23u  IPv4  ...  TCP *:3000 (LISTEN)
```

### Method 3: Check Process Tree
```bash
# If Docker: process will show "docker" or "containerd"
ps aux | grep 3000 | grep -v grep

# If Local: will show "next dev" or "node" directly
```

## Current Status Check

Run this to see what's actually running:

```bash
# Check Docker containers
echo "=== Docker Containers ==="
docker compose -f docker-compose.dev.yml ps

# Check local processes
echo -e "\n=== Local Node Processes ==="
ps aux | grep -E "next dev|node.*3000" | grep -v grep

# Check what's on port 3000
echo -e "\n=== Port 3000 ==="
lsof -i :3000 | grep LISTEN
```

## How to Switch to Docker

If you're currently running locally and want to use Docker:

```bash
# 1. Stop local dev server (Ctrl+C in terminal running npm run dev)

# 2. Start Docker
docker compose -f docker-compose.dev.yml up --build

# 3. Verify it's Docker
docker compose -f docker-compose.dev.yml ps
# Should show: ai2aim-rx-dev container running
```

## How to Verify Docker is Using Your .env

```bash
# Check environment variables inside container
docker compose -f docker-compose.dev.yml exec app env | grep SUPABASE

# Should show your actual values from .env file
```

## Visual Indicators

**Docker is running if:**
- ✅ `docker ps` shows `ai2aim-rx-dev` container
- ✅ Logs show "docker" in process name
- ✅ Changes to code trigger rebuild in Docker logs
- ✅ `docker compose logs` shows Next.js output

**Local npm is running if:**
- ✅ `npm run dev` process visible in Activity Monitor/Task Manager
- ✅ Terminal shows "next dev" output directly
- ✅ No Docker containers running
- ✅ Changes trigger hot reload in your terminal (not Docker logs)

## Quick Test

```bash
# Run this script
./verify-docker.sh

# Or manually:
docker compose -f docker-compose.dev.yml ps
curl http://localhost:3000/api/health
```
