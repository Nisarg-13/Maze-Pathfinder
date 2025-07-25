#!/bin/bash

echo "🚀 Maze Pathfinder Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before deploying."
    exit 1
fi

echo "🔍 Linting code..."
npm run lint

echo "🏗️  Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the issues before deploying."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "📋 Next Steps:"
echo "1. Deploy WebSocket server to Railway/Render/VPS"
echo "2. Update NEXT_PUBLIC_WS_URL in your environment variables"
echo "3. Deploy frontend to Vercel"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"