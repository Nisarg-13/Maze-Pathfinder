# Deployment Guide

This project requires two separate deployments due to WebSocket requirements:

## Option 1: Vercel + Railway (Recommended)

### Step 1: Deploy WebSocket Server to Railway

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Create New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Connect Repository**: Connect your GitHub repository
4. **Configure Build**:
   - Railway will auto-detect Node.js
   - Set start command: `npm run server`
   - Set PORT environment variable (Railway provides this automatically)

5. **Get WebSocket URL**: After deployment, Railway will provide a URL like:
   `https://your-app-name.railway.app`
   Your WebSocket URL will be: `wss://your-app-name.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Import Project**: Click "New Project" → Import from GitHub
3. **Configure Environment Variables**:
   - Add `NEXT_PUBLIC_WS_URL` = `wss://your-app-name.railway.app`
4. **Deploy**: Vercel will automatically build and deploy

### Step 3: Update Configuration

1. Update `.env.production` with your actual Railway WebSocket URL
2. Update `vercel.json` with your WebSocket server URL

## Option 2: Vercel + Render

### WebSocket Server on Render:
1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect your repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run server`
   - Environment: Node

### Frontend on Vercel:
Same as Option 1, but use your Render WebSocket URL

## Option 3: Full Docker Deployment

### Build and run with Docker:

```bash
# Build WebSocket server
docker build -f Dockerfile.server -t maze-server .

# Run WebSocket server
docker run -p 8080:8080 maze-server

# Build and run Next.js app
docker build -t maze-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_WS_URL=ws://localhost:8080 maze-frontend
```

## Option 4: VPS Deployment

### On your VPS:

```bash
# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone and setup
git clone <your-repo>
cd maze-pathfinder
npm install

# Start WebSocket server with PM2
pm2 start server.ts --name "maze-server" --interpreter tsx

# Build and start Next.js
npm run build
pm2 start "npm start" --name "maze-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Environment Variables

### For Development:
```
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### For Production:
```
NEXT_PUBLIC_WS_URL=wss://your-websocket-server-domain.com
```

## Testing Deployment

1. Open your deployed frontend URL
2. Try creating a maze and solving it
3. Check browser console for WebSocket connection status
4. Verify real-time animation works

## Troubleshooting

### WebSocket Connection Issues:
- Ensure WebSocket server is running and accessible
- Check CORS configuration in server.ts
- Verify environment variables are set correctly
- Use WSS (secure WebSocket) for HTTPS sites

### Build Issues:
- Ensure all dependencies are installed
- Check Node.js version compatibility (18+)
- Verify TypeScript compilation

### Performance:
- Consider using a CDN for static assets
- Enable gzip compression on your server
- Monitor WebSocket connection limits on your hosting platform