# Builder.io Quick Start - See Your App

## ⚠️ Important: Builder.io doesn't connect to GitHub

Builder.io connects to your **running app**, not GitHub. You need to:

1. **Run your app locally** (or deploy it)
2. **Tell Builder.io where your app is running**

## 🚀 Quick Setup (3 Steps)

### Step 1: Start Your App

```bash
npm run dev
```

Your app will run at: **http://localhost:3000**

### Step 2: Configure Builder.io

1. Go to [https://builder.io](https://builder.io) and log in
2. Click on your **Space/Workspace**
3. Go to **Settings** → **Space Settings**
4. Find **"Preview URL"** or **"Development URL"**
5. Enter: `http://localhost:3000`
6. **Save**

### Step 3: View Your App in Builder.io

1. In Builder.io, click **"New Page"**
2. Set the URL path to: `/builder` or `/builder/home`
3. Click **"Preview"** button (top right)
4. You should see your app!

## 📍 Current App Pages

Your app has these pages you can view/edit:

- **Home**: `http://localhost:3000/` 
- **Builder.io Home**: `http://localhost:3000/builder`
- **Login**: `http://localhost:3000/auth/login`
- **Dashboard**: `http://localhost:3000/dashboard` (requires login)

## 🎨 Create Your First Builder.io Page

1. **In Builder.io:**
   - Click "New Page"
   - Name it "Home Page"
   - Set URL path to: `/builder/home`
   - Design your page visually
   - Click "Publish"

2. **View it:**
   - Visit: `http://localhost:3000/builder/home`
   - Your Builder.io page will appear!

## 🔍 Troubleshooting

### "Preview not loading" or "Can't connect"

**Solution:**
- ✅ Make sure `npm run dev` is running
- ✅ Check Preview URL is `http://localhost:3000`
- ✅ Verify API key in `.env.local`
- ✅ Restart dev server after changing `.env.local`

### "DNS doesn't connect with GitHub"

**This is normal!** Builder.io doesn't use GitHub. It uses:
- **Development**: `http://localhost:3000` (your running app)
- **Production**: Your deployed URL (e.g., `https://your-app.vercel.app`)

## 📱 For Production (Later)

When you deploy your app:

1. Deploy to Vercel/Netlify/etc.
2. Get your deployed URL (e.g., `https://ai2aim-rx.vercel.app`)
3. In Builder.io settings, set **"Production URL"** to your deployed URL
4. Builder.io will use that for production previews

## ✅ Quick Test

Run this to verify everything works:

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Test the connection
curl http://localhost:3000/builder
```

If you see HTML, your app is running! Now Builder.io can connect to it.

## 🎯 Next Steps

1. ✅ Start dev server: `npm run dev`
2. ✅ Set Preview URL in Builder.io: `http://localhost:3000`
3. ✅ Create a test page in Builder.io
4. ✅ Visit `http://localhost:3000/builder` to see it!

---

**Remember:** Builder.io needs your app to be **running** to preview it. GitHub is just for code storage!
