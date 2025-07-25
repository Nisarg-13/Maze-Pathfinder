# Quick Deployment Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Deploy WebSocket Server (Railway - Free Tier)

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js and deploy
   - **Important**: Railway will automatically set the PORT environment variable

3. **Get your WebSocket URL**:
   - After deployment, go to your Railway dashboard
   - Click on your service → "Settings" → "Domains"
   - Copy the domain (e.g., `your-app-name.railway.app`)
   - Your WebSocket URL will be: `wss://your-app-name.railway.app`

### Step 2: Deploy Frontend (Vercel - Free Tier)

1. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import from GitHub
   - Select your repository
   - **Before deploying**, add environment variable:
     - Key: `NEXT_PUBLIC_WS_URL`
     - Value: `wss://your-app-name.railway.app` (from Step 1)
   - Click "Deploy"

### Step 3: Test Your Deployment

1. Open your Vercel URL
2. Create a simple maze
3. Click "Solve Maze"
4. Verify the animation works

## 🔧 Alternative: Render + Vercel

If Railway doesn't work, use Render:

1. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - "New" → "Web Service"
   - Connect GitHub repo
   - Settings:
     - Build Command: `npm install`
     - Start Command: `npm run server`
     - Environment: Node

2. **Get Render URL** and use it in Vercel environment variables

## 🐛 Troubleshooting

### WebSocket Connection Failed:
- Check browser console for exact error
- Verify environment variable is set correctly in Vercel
- Ensure WebSocket server is running (check Railway/Render logs)

### CORS Issues:
- The server.ts already includes CORS headers
- Make sure you're using `wss://` (not `ws://`) for production

### Build Failures:
- Check that all dependencies are in package.json
- Verify Node.js version compatibility

## 📱 Test Commands

```bash
# Test locally first
npm install
npm run server:dev  # Terminal 1
npm run dev         # Terminal 2

# Test production build
npm run build
npm start
```

## 🎯 Expected URLs

- **Frontend**: `https://your-project.vercel.app`
- **WebSocket**: `wss://your-project.railway.app`
- **Health Check**: `https://your-project.railway.app/health`