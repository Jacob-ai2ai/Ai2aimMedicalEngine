#!/bin/bash
echo "🔍 Docker Connection Verification"
echo "================================"

# Check container status
echo -e "\n1. Container Status:"
docker compose -f docker-compose.dev.yml ps 2>/dev/null || docker-compose -f docker-compose.dev.yml ps 2>/dev/null || echo "⚠️  No containers running"

# Check health
echo -e "\n2. Health Check:"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ App is responding at http://localhost:3000"
  curl -s http://localhost:3000/api/health | head -1
else
  echo "❌ App not responding on port 3000"
fi

# Check env vars (if container is running)
echo -e "\n3. Environment Variables in Container:"
if docker compose -f docker-compose.dev.yml exec -T app env 2>/dev/null | grep -q SUPABASE; then
  docker compose -f docker-compose.dev.yml exec -T app env 2>/dev/null | grep SUPABASE | head -2
else
  echo "⚠️  Container not running or env vars not set"
fi

# Check logs
echo -e "\n4. Recent Logs (last 3 lines):"
docker compose -f docker-compose.dev.yml logs --tail=3 app 2>/dev/null || echo "⚠️  No logs available"

echo -e "\n✅ Verification complete!"
