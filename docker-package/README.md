# Docker Development Package - AI2AIM RX Platform

This package contains everything your development team needs to run the AI2AIM RX platform in Docker.

## 📦 What's Included

- **Dockerfile.dev** - Development Docker configuration
- **docker-compose.dev.yml** - Docker Compose setup
- **.dockerignore** - Files excluded from Docker builds
- **.env.example** - Environment variables template
- **package.json** & **package-lock.json** - Project dependencies
- **.nvmrc** - Node.js version specification
- **Documentation** - Setup guides and verification scripts

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git (to clone the full repository)

### Setup Steps

1. **Get the full repository** (this package is just Docker config):
   ```bash
   git clone <repository-url>
   cd ai2aimRX
   ```

2. **Copy Docker files** (if not already in repo):
   ```bash
   # Copy files from docker-package/ to project root
   cp docker-package/* .
   ```

3. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

4. **Start Docker**:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

5. **Access the app**:
   - Frontend: http://localhost:3000
   - Health check: http://localhost:3000/api/health

## 📋 Required Environment Variables

Edit `.env` and add:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key
```

**Get Supabase credentials from**: Supabase Dashboard → Project Settings → API

## 📚 Documentation

- **DOCKER_SETUP.md** - Detailed Docker setup guide
- **TEAM_SETUP.md** - Complete team onboarding guide
- **DOCKER_VERIFY.md** - Verification and troubleshooting
- **verify-docker.sh** - Automated verification script

## ✅ Verification

After starting Docker, verify everything works:

```bash
# Run verification script
chmod +x verify-docker.sh
./verify-docker.sh

# Or manually check
docker compose -f docker-compose.dev.yml ps
curl http://localhost:3000/api/health
```

## 🔧 Common Commands

```bash
# Start containers
docker compose -f docker-compose.dev.yml up

# Start in background
docker compose -f docker-compose.dev.yml up -d

# Stop containers
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f app

# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml up --build

# Access container shell
docker compose -f docker-compose.dev.yml exec app sh
```

## 🆘 Troubleshooting

### Container won't start
- Check logs: `docker compose -f docker-compose.dev.yml logs app`
- Verify `.env` file exists with correct variables
- Ensure Docker Desktop is running

### Port 3000 already in use
- Change port in `docker-compose.dev.yml`: `"3001:3000"`
- Or stop existing process: `lsof -ti:3000 | xargs kill`

### Environment variables not loading
- Verify `.env` file is in project root
- Check variable names match exactly (case-sensitive)
- Restart container after changing `.env`

### Build errors
- Rebuild from scratch: `docker compose -f docker-compose.dev.yml build --no-cache`
- Check Docker has enough resources (4GB+ RAM recommended)

## 📝 Notes

- Hot reload is enabled - code changes reflect immediately
- `node_modules` and `.next` are excluded from mounts for performance
- All environment variables should be in `.env` (gitignored)
- The container runs in development mode with full debugging

## 🔗 Additional Resources

- Full project documentation: See `README.md` in main repository
- Database setup: See `TEAM_SETUP.md` for migration instructions
- Deployment guide: See `DEPLOYMENT_GUIDE.md` for production setup

---

**Need Help?** Check `DOCKER_VERIFY.md` for detailed troubleshooting steps.
