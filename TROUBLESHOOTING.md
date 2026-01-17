# Troubleshooting Guide

## Common Localhost Errors

### Issue: Wrong Application Showing on Port 3000

**Symptoms:**
- Port 3000 shows a different application (e.g., "War-Scryer" instead of "AI2AIM RX")
- Frontend doesn't match expected application

**Solution:**
1. Kill all processes on port 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Verify you're in the correct directory:
   ```bash
   pwd
   # Should be: /Users/jacobchristian/Downloads/ai2aimRX
   ```

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```

4. Restart the server:
   ```bash
   npm run dev
   ```

### Issue: Port Already in Use

**Symptoms:**
- Error: "Port 3000 is already in use"
- Server won't start

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Backend Not Starting

**Symptoms:**
- Backend API (port 8000) not responding
- Error: "Cannot find module"

**Solution:**
1. Check dependencies are installed:
   ```bash
   npm install
   ```

2. Verify server file exists:
   ```bash
   ls -la server/index.js
   ```

3. Start backend manually:
   ```bash
   node server/index.js
   ```

### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- Frontend can't connect to backend

**Solution:**
1. Check backend CORS configuration in `server/index.js`
2. Verify `FRONTEND_URL` in `.env.local`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```

3. Restart backend server

### Issue: Environment Variables Not Loading

**Symptoms:**
- "supabaseUrl is required" errors
- API keys not found

**Solution:**
1. Verify `.env.local` exists:
   ```bash
   ls -la .env.local
   ```

2. Check variables are set:
   ```bash
   cat .env.local | grep SUPABASE
   ```

3. Restart dev server after changing `.env.local`

### Issue: Both Servers Won't Start Together

**Symptoms:**
- `npm run dev:all` fails
- Only one server starts

**Solution:**
1. Start servers separately:
   ```bash
   # Terminal 1
   npm run dev:frontend

   # Terminal 2
   npm run dev:backend
   ```

2. Or use separate terminal windows

## Quick Fixes

### Reset Everything
```bash
# Stop all processes
pkill -f "next dev"
pkill -f "node.*server"

# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Restart
npm run dev:all
```

### Check Server Status
```bash
# Check ports
lsof -ti:3000 && echo "Port 3000 in use" || echo "Port 3000 free"
lsof -ti:8000 && echo "Port 8000 in use" || echo "Port 8000 free"

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:8000/health
```

### Verify Configuration
```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Check dependencies
npm list --depth=0
```

## Getting Help

If issues persist:
1. Check console logs for specific errors
2. Review `SETUP.md` for detailed instructions
3. Verify all environment variables are set
4. Check that database migrations are applied

---

**Most common fix:** Kill processes and restart servers fresh!
