@echo off
echo 🚀 Starting Enterprise System...

echo 📦 Installing dependencies...
npm install -g pnpm
pnpm install

echo 🔨 Building packages...
pnpm run build

echo ⚙️ Setting up API service...
cd services\api
npx prisma generate
npx prisma db push
cd ..\..

echo 🐳 Starting Docker services...
docker-compose up --build -d

echo ⏳ Waiting for services...
timeout /t 45 /nobreak > nul

echo 🔍 Checking service health...
curl -f http://localhost:3001/health || echo ❌ API not ready yet, check: docker-compose logs api

echo ✅ System started successfully!
echo 🌐 API: http://localhost:3001
echo 📚 Swagger: http://localhost:3001/api/docs
echo 💚 Health: http://localhost:3001/health
echo 📋 Full setup guide: SETUP.md
pause