# Builder.io Connection Guide

## Connecting Builder.io to Your App

Builder.io needs to know where your app is running to preview and edit pages. Here's how to connect them.

## Step 1: Start Your Development Server

First, make sure your Next.js app is running:

```bash
npm run dev
```

Your app should be running at: `http://localhost:3000`

## Step 2: Configure Builder.io Preview URL

1. **Log in to Builder.io:**
   - Go to [https://builder.io](https://builder.io)
   - Sign in with your account

2. **Go to Space Settings:**
   - Click on your space/workspace
   - Go to **Settings** → **Space Settings**

3. **Set Preview URL:**
   - Find **"Preview URL"** or **"Development URL"** setting
   - Enter: `http://localhost:3000`
   - Save the settings

## Step 3: Configure Production URL (Optional)

If you have a deployed version:

1. Go to **Space Settings**
2. Set **"Production URL"** to your deployed URL:
   - Example: `https://your-app.vercel.app`
   - Or: `https://your-domain.com`

## Step 4: Verify API Key

Make sure your API key is set in `.env.local`:

```env
NEXT_PUBLIC_BUILDER_API_KEY=35ef8c33e09249b994ebaf72d1f85dab
```

## Step 5: Test the Connection

1. **In Builder.io:**
   - Click "New Page"
   - Create a simple test page
   - Set URL path to `/builder/test`
   - Click "Preview" button

2. **In Your App:**
   - Visit `http://localhost:3000/builder/test`
   - You should see your Builder.io page

## Step 6: Enable Visual Editing

To edit pages directly in Builder.io:

1. **In Builder.io:**
   - Open any page
   - Click "Edit" button
   - You should see your app in the preview panel

2. **If preview doesn't load:**
   - Check that your dev server is running
   - Verify the Preview URL in settings
   - Check browser console for errors
   - Make sure API key is correct

## Troubleshooting

### Preview Not Loading

**Issue:** Builder.io preview shows blank or error

**Solutions:**
1. Verify dev server is running: `npm run dev`
2. Check Preview URL in Builder.io settings
3. Verify API key in `.env.local`
4. Restart dev server after changing `.env.local`
5. Check browser console for errors
6. Try accessing the page directly: `http://localhost:3000/builder/test`

### DNS/Connection Issues

**Issue:** "DNS doesn't seem to connect with GitHub"

**Note:** Builder.io doesn't connect to GitHub directly. It connects to your running app.

**Solutions:**
1. **For Development:**
   - Use `http://localhost:3000` as Preview URL
   - Make sure dev server is running

2. **For Production:**
   - Deploy your app (Vercel, Netlify, etc.)
   - Use the deployed URL as Production URL
   - Example: `https://ai2aim-rx.vercel.app`

3. **For Testing:**
   - Use a tunneling service like ngrok:
     ```bash
     npx ngrok http 3000
     ```
   - Use the ngrok URL in Builder.io settings

### API Key Issues

**Issue:** Builder.io shows "Invalid API Key"

**Solutions:**
1. Verify API key in `.env.local`
2. Restart dev server after adding API key
3. Check API key in Builder.io account settings
4. Make sure key starts with `NEXT_PUBLIC_` prefix

## Quick Test

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/builder`
3. You should see the Builder.io welcome page
4. Create a page in Builder.io with path `/builder/test`
5. Visit: `http://localhost:3000/builder/test`
6. Your Builder.io page should appear!

## Next Steps

Once connected:

1. **Create Pages:**
   - Design pages visually in Builder.io
   - Set URL paths
   - Publish pages

2. **Use Custom Components:**
   - Drag and drop MedicalCard, PrescriptionStatusBadge, etc.
   - Customize with Builder.io's visual editor

3. **Preview Changes:**
   - Use Builder.io's preview mode
   - See changes in real-time

## Production Deployment

When deploying to production:

1. **Deploy your app** (Vercel, Netlify, etc.)
2. **Update Builder.io settings:**
   - Set Production URL to your deployed URL
   - Example: `https://ai2aim-rx.vercel.app`
3. **Test:**
   - Create pages in Builder.io
   - They'll appear on your production site

## Support

If you're still having issues:

1. Check Builder.io documentation: https://www.builder.io/c/docs
2. Verify all environment variables are set
3. Check that your app is accessible at the Preview URL
4. Review browser console for errors
