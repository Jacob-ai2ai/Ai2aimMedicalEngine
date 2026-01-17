# Docker Development Setup Guide

This guide will help you set up the AI2AIM RX platform using Docker for local development.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git
- A `.env.local` file with your environment variables (see below)

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd ai2aimRX
   ```

2. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   # Then edit .env and fill in your Supabase credentials
   ```

3. **Start the development environment**:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
   Or with the older docker-compose command:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - The app will automatically reload when you make code changes

## Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` and fill in your values:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Builder.io
NEXT_PUBLIC_BUILDER_API_KEY=your_builder_api_key

# Optional: AI Services
GEMINI_API_KEY=your_gemini_api_key
SERP_API_KEY=your_serp_api_key

# Optional: Database (if using local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Docker Commands

### Start Development Server
```bash
docker compose -f docker-compose.dev.yml up
# Or: docker-compose -f docker-compose.dev.yml up
```

### Start in Background (Detached Mode)
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Stop the Server
```bash
docker compose -f docker-compose.dev.yml down
```

### Rebuild After Dependency Changes
```bash
docker compose -f docker-compose.dev.yml up --build
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Execute Commands in Container
```bash
# Run npm commands
docker-compose -f docker-compose.dev.yml exec app npm run lint

# Access shell
docker-compose -f docker-compose.dev.yml exec app sh
```

### Clean Up
```bash
# Stop and remove containers, networks
docker-compose -f docker-compose.dev.yml down

# Remove volumes (if any)
docker-compose -f docker-compose.dev.yml down -v

# Remove images
docker-compose -f docker-compose.dev.yml down --rmi all
```

## Development Workflow

1. **Code Changes**: Since we're mounting the source code as a volume, your changes will be reflected immediately with Next.js hot reload.

2. **Dependency Changes**: If you add/remove dependencies:
   ```bash
   # Rebuild the container
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Database Migrations**: Run Supabase migrations through the Supabase CLI or dashboard. The app connects to your Supabase instance.

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Change the port mapping in docker-compose.dev.yml
ports:
  - "3001:3000"  # Use 3001 on host instead
```

### Container Won't Start
1. Check logs: `docker-compose -f docker-compose.dev.yml logs`
2. Verify `.env.local` has all required variables
3. Try rebuilding: `docker-compose -f docker-compose.dev.yml up --build --force-recreate`

### Hot Reload Not Working
- Ensure volumes are properly mounted (check `docker-compose.dev.yml`)
- Check file permissions
- Try restarting: `docker-compose -f docker-compose.dev.yml restart`

### Node Modules Issues
If you encounter module resolution issues:
```bash
# Remove node_modules volume and rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

## Production Build

For production, use the existing `Dockerfile` and `docker-compose.yml`:

```bash
docker-compose up --build
```

## Sharing with Team

1. **Share the repository** (via Git)
2. **Team members set up**:
   ```bash
   git clone <repo>
   cd ai2aimRX
   cp .env.example .env
   # Edit .env and fill in Supabase credentials
   docker compose -f docker-compose.dev.yml up --build
   ```
3. **Share Supabase credentials** securely (use a password manager or secure channel)

## Notes

- The development setup uses volume mounts for hot reload
- `node_modules` and `.next` are excluded from mounts for performance
- All environment variables should be in `.env` (which is gitignored)
- `.env.local` is also supported and takes precedence if it exists
- The container runs as root in dev mode for simplicity (production uses non-root user)

## Support

If you encounter issues:
1. Check the logs: `docker-compose -f docker-compose.dev.yml logs`
2. Verify your environment variables
3. Ensure Docker has enough resources allocated (4GB+ RAM recommended)
4. Check that ports 3000 is available
