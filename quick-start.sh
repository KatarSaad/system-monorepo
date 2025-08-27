#!/bin/bash

echo "🚀 Starting Enterprise System..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install -g pnpm
pnpm install

# Build packages
echo "🔨 Building packages..."
pnpm run build

# Setup API service
echo "⚙️ Setting up API service..."
cd services/api
npx prisma generate
npx prisma db push
cd ../..

# Start services
echo "🐳 Starting Docker services..."
docker-compose up --build -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 45

# Check health
echo "🔍 Checking service health..."
curl -f http://localhost:3001/health || echo "❌ API not ready yet, check logs: docker-compose logs api"

echo "✅ System started successfully!"
echo "🌐 API: http://localhost:3001"
echo "📚 Swagger: http://localhost:3001/api/docs"
echo "💚 Health: http://localhost:3001/health"
echo "📋 Full setup guide: SETUP.md"