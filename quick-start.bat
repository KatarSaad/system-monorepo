@echo off
echo Starting Enterprise System...

echo Installing dependencies...
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing pnpm...
    npm install -g pnpm
)

echo Installing project dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo Building packages...
pnpm run build
if %errorlevel% neq 0 (
    echo Warning: Build failed, continuing...
)

echo Setting up API service...
cd services\api
if not exist "node_modules" (
    echo Installing API dependencies...
    npm install
)

echo Generating Prisma client...
npx prisma generate

echo Starting Docker services...
cd ..\..
docker-compose up --build -d
if %errorlevel% neq 0 (
    echo Error: Docker failed to start
    pause
    exit /b 1
)

echo Waiting for services...
timeout /t 30 /nobreak > nul

echo System started!
echo API: http://localhost:3001
echo Swagger: http://localhost:3001/api/docs
echo Health: http://localhost:3001/health
echo.
echo If services don't respond, run: docker-compose logs api
pause