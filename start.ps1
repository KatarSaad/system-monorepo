Write-Host "Starting Enterprise System..." -ForegroundColor Green

Write-Host "Installing dependencies..." -ForegroundColor Yellow
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host "Installing project dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host "Starting Docker tools (MySQL + Redis)..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting for database..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Setting up API service..." -ForegroundColor Yellow
Set-Location "services\api"
if (!(Test-Path "node_modules")) {
    Write-Host "Installing API dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Starting API server..." -ForegroundColor Yellow
npm run start:dev