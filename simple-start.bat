@echo off
echo Starting System...

echo Step 1: Install pnpm
npm install -g pnpm

echo Step 2: Install dependencies  
pnpm install

echo Step 3: Start Docker
docker-compose up -d

echo Done! Check http://localhost:3001
pause