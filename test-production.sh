#!/bin/bash

echo "🚀 Building EcoPro for Production..."
echo ""

# Build client and server
echo "📦 Building client..."
pnpm run build:client

echo "📦 Building server..."
pnpm run build:server

echo ""
echo "✅ Build complete!"
echo ""
echo "🌐 Starting production server..."
echo "   Server will run on: http://localhost:3000"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

# Start the server
PORT=3000 pnpm start
