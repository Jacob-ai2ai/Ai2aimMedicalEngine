# Docker Setup Guide

## 🐳 Docker Configuration

This guide explains how to run the AI2AIM RX platform using Docker.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually included with Docker Desktop)
- Environment variables configured in `.env.local`

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t ai2aim-rx:latest .
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the application image
- Start the container on port 3000
- Load environment variables from `.env.local`

### 3. Access the Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## Docker Commands

### Build Image
```bash
docker build -t ai2aim-rx:latest .
```

### Run Container
```bash
docker run -p 3000:3000 \
  --env-file .env.local \
  ai2aim-rx:latest
```

### Stop Container
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### Remove Everything
```bash
docker-compose down -v
docker rmi ai2aim-rx:latest
```

## Docker Compose Services

### `app` Service
- **Image**: Built from Dockerfile
- **Port**: 3000
- **Environment**: Loads from `.env.local`
- **Health Check**: Monitors `/api/health` endpoint

## Environment Variables

Docker Compose automatically loads variables from `.env.local`. Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://avmoqiwlgkshdyrqxddl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ro_S5l7rALSCC4yoN68FoQ_Xr9qDpnm
NEXT_PUBLIC_BUILDER_API_KEY=35ef8c33e09249b994ebaf72d1f85dab
GEMINI_API_KEY=AIzaSyDOimpzV-lEJDAyZd-3CrJyLM5FjbRgwPc
SERP_API_KEY=082d74ec4492adc687a70aff216b08a183c1da3a95746b989fd0b45deece71b6
DATABASE_URL=postgresql://postgres:Business123$%^&**(@db.avmoqiwlgkshdyrqxddl.supabase.co:5432/postgres
```

## Development vs Production

### Development
For local development, use:
```bash
npm run dev
```

### Production (Docker)
For production deployment:
```bash
docker-compose up -d
```

## Multi-Stage Build

The Dockerfile uses a multi-stage build:

1. **deps**: Installs production dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates optimized production image

This results in a smaller final image (~200MB vs ~1GB).

## Health Checks

The container includes a health check that monitors:
- Endpoint: `http://localhost:3000/api/health`
- Interval: Every 30 seconds
- Timeout: 10 seconds
- Retries: 3

## Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Build Fails
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t ai2aim-rx:latest .
```

### Environment Variables Not Loading
```bash
# Verify .env.local exists
ls -la .env.local

# Check variables are loaded
docker-compose config
```

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check container status
docker ps -a
```

## Docker Hub Deployment

### Build for Production
```bash
docker build -t yourusername/ai2aim-rx:latest .
```

### Push to Docker Hub
```bash
docker login
docker push yourusername/ai2aim-rx:latest
```

### Pull and Run
```bash
docker pull yourusername/ai2aim-rx:latest
docker run -p 3000:3000 --env-file .env.local yourusername/ai2aim-rx:latest
```

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use secrets management** in production (Docker secrets, Kubernetes secrets, etc.)
3. **Run as non-root user** - Already configured in Dockerfile
4. **Keep images updated** - Regularly rebuild with latest base images
5. **Scan for vulnerabilities**:
   ```bash
   docker scan ai2aim-rx:latest
   ```

## Production Deployment

For production deployment:

1. **Use environment-specific `.env` files**
2. **Enable HTTPS** (use reverse proxy like Nginx)
3. **Set up monitoring** (health checks, logging)
4. **Use orchestration** (Kubernetes, Docker Swarm)
5. **Implement CI/CD** (GitHub Actions, GitLab CI)

## Next Steps

1. ✅ Docker configuration complete
2. Build and test locally
3. Deploy to production environment
4. Set up CI/CD pipeline
5. Configure monitoring and logging

---

**🐳 Docker setup complete! Your application is containerized and ready to deploy.**
