# Starting Docker - Step by Step

## Prerequisites Check

1. **Docker Desktop must be running**
   - Check: Docker icon in menu bar should be active
   - If not: Open Docker Desktop app and wait for it to start (whale icon should be steady)

2. **`.env` file must exist**
   - Check: `ls -la .env`
   - If missing: `cp .env.example .env`
   - Then edit `.env` and add your Supabase credentials

## Start Docker

Once Docker Desktop is running:

```bash
# 1. Make sure local server is stopped
pkill -f "next dev"

# 2. Start Docker
docker compose -f docker-compose.dev.yml up --build

# Or in background:
docker compose -f docker-compose.dev.yml up --build -d
```

## Verify Docker is Running

```bash
# Check container status
docker compose -f docker-compose.dev.yml ps

# Should show:
# NAME            STATUS          PORTS
# ai2aim-rx-dev   Up X seconds    0.0.0.0:3000->3000/tcp

# Check logs
docker compose -f docker-compose.dev.yml logs -f app

# Test connection
curl http://localhost:3000/api/health
```

## Troubleshooting

**"Cannot connect to Docker daemon"**
- Docker Desktop is not running
- Solution: Open Docker Desktop app, wait for it to fully start

**".env file not found"**
- Solution: `cp .env.example .env` then edit with your credentials

**"Port 3000 already in use"**
- Local server still running
- Solution: `pkill -f "next dev"` or change port in docker-compose.dev.yml

**Container exits immediately**
- Check logs: `docker compose -f docker-compose.dev.yml logs app`
- Usually means missing environment variables or build error
