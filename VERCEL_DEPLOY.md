# Deploy to Vercel - Quick Guide

## 🚀 Deploy Your App to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `ai2aim-rx` (or your choice)
   - Directory: `./` (current directory)
   - Override settings? **No**

4. **Add Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_BUILDER_API_KEY
   vercel env add GEMINI_API_KEY
   vercel env add SERP_API_KEY
   ```

5. **Redeploy with env vars:**
   ```bash
   vercel --prod
   ```

### Option 2: Using GitHub Integration (Easier)

1. **Go to Vercel:**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Select your GitHub repository: `Jacob-ai2ai/Ai2aimMedicalEngine`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add each variable:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     NEXT_PUBLIC_BUILDER_API_KEY=35ef8c33e09249b994ebaf72d1f85dab
     GEMINI_API_KEY=your-gemini-key
     SERP_API_KEY=your-serp-key
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

## 🔗 Connect Builder.io to Vercel

Once deployed:

1. **Get your Vercel URL:**
   - Example: `https://ai2aim-rx.vercel.app`

2. **Update Builder.io:**
   - Go to Builder.io → Settings → Space Settings
   - Set **"Production URL"** to your Vercel URL
   - Save

3. **Test:**
   - Create a page in Builder.io
   - It will appear on your Vercel site!

## 📋 Environment Variables Checklist

Make sure these are set in Vercel:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_BUILDER_API_KEY` (already have: 35ef8c33e09249b994ebaf72d1f85dab)
- ✅ `GEMINI_API_KEY`
- ✅ `SERP_API_KEY`

## 🎯 Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls
```

## 🔍 Verify Deployment

After deployment:

1. Visit your Vercel URL
2. Check `/api/health` endpoint
3. Test Builder.io pages at `/builder/*`
4. Verify all features work

## 📝 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Update Builder.io Production URL
4. ✅ Test your deployed app
5. ✅ Share your live URL!

---

**Your app will be live at:** `https://your-project-name.vercel.app`
