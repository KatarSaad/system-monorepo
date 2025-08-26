# 🚀 Build and Run Guide

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Redis** 6+ (optional, for caching)
- **Git**

## 🏗️ Build Process

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Install all package dependencies
npm run install:packages

# Or manually install each package
cd packages/core && npm install
cd ../infrastructure && npm install
cd ../security && npm install
cd ../monitoring && npm install
cd ../validation && npm install
cd ../shared && npm install
cd ../audit && npm install
cd ../rate-limiting && npm install
cd ../file-storage && npm install
cd ../search && npm install
cd ../feature-flags && npm install
cd ../health && npm install
cd ../config && npm install
cd ../backup && npm install
cd ../queue && npm install
cd ../notifications && npm install

# API service dependencies
cd ../../services/api && npm install
```

### 2. Build Packages

```bash
# Build all packages
npm run build:packages

# Or build individually
npm run build:core
npm run build:infrastructure
npm run build:security
npm run build:monitoring
npm run build:validation
npm run build:shared
npm run build:audit
npm run build:rate-limiting
npm run build:file-storage
npm run build:search
npm run build:feature-flags
npm run build:health
npm run build:config
npm run build:backup
npm run build:queue
npm run build:notifications
```

### 3. Build API Service

```bash
cd services/api
npm run build
```

## ⚙️ Configuration

### 1. Environment Variables

Create `.env` file in the root:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/system_db"
DB_POOL_SIZE=10

# Redis (optional)
REDIS_URL="redis://localhost:6379"
REDIS_TTL=3600

# Security
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ENCRYPTION_KEY="your-32-character-encryption-key"
FILE_ENCRYPTION_KEY="your-file-encryption-key"
BACKUP_ENCRYPTION_KEY="your-backup-encryption-key"

# Features
RATE_LIMITING_ENABLED=true
AUDIT_LOGGING_ENABLED=true
METRICS_ENABLED=true

# Monitoring
PROMETHEUS_PORT=9090
SENTRY_DSN="your-sentry-dsn"

# File Storage
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# External Services (optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
SENDGRID_API_KEY="your-sendgrid-key"
```

### 2. Database Setup

```bash
# Create database
createdb system_db

# Run migrations (if using Prisma)
cd services/api
npx prisma migrate dev
npx prisma generate
```

### 3. Package Configuration

Create `config/packages.json`:

```json
{
  "audit": {
    "enabled": true,
    "retentionDays": 365
  },
  "rateLimiting": {
    "windowMs": 900000,
    "maxRequests": 100
  },
  "fileStorage": {
    "provider": "local",
    "maxFileSize": 10485760,
    "allowedTypes": ["image/jpeg", "image/png", "application/pdf"]
  },
  "search": {
    "cacheEnabled": true,
    "cacheTtl": 300
  },
  "backup": {
    "schedule": "0 2 * * *",
    "retention": 30,
    "encrypt": true
  }
}
```

## 🚀 Running the System

### Development Mode

```bash
# Start all services in development
npm run dev

# Or start individually
npm run dev:api
npm run dev:monitoring
npm run dev:health
```

### Production Mode

```bash
# Build everything
npm run build

# Start production server
npm run start:prod

# Or with PM2
npm install -g pm2
pm2 start ecosystem.config.js
```

### Docker (Recommended)

```bash
# Build and start with Docker Compose
docker-compose up --build

# Or build individual services
docker build -t system-api ./services/api
docker run -p 3000:3000 system-api
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# System health
curl http://localhost:3000/health

# Detailed health
curl http://localhost:3000/health/detailed

# Metrics (Prometheus format)
curl http://localhost:3000/metrics
```

### Monitoring Setup

```bash
# Start Prometheus (if installed)
prometheus --config.file=monitoring/prometheus.yml

# Start Grafana (if installed)
grafana-server --config=monitoring/grafana.ini
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run package tests
npm run test:packages

# Run API tests
cd services/api && npm test
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Load Testing

```bash
# Install k6 (load testing tool)
npm install -g k6

# Run load tests
k6 run tests/load/api-load-test.js
```

## 📦 Package Scripts

Add to root `package.json`:

```json
{
  "scripts": {
    "install:packages": "npm run install:core && npm run install:infrastructure && npm run install:security && npm run install:monitoring && npm run install:validation && npm run install:shared && npm run install:audit && npm run install:rate-limiting && npm run install:file-storage && npm run install:search && npm run install:feature-flags && npm run install:health && npm run install:config && npm run install:backup && npm run install:queue && npm run install:notifications",
    "install:core": "cd packages/core && npm install",
    "install:infrastructure": "cd packages/infrastructure && npm install",
    "install:security": "cd packages/security && npm install",
    "install:monitoring": "cd packages/monitoring && npm install",
    "install:validation": "cd packages/validation && npm install",
    "install:shared": "cd packages/shared && npm install",
    "install:audit": "cd packages/audit && npm install",
    "install:rate-limiting": "cd packages/rate-limiting && npm install",
    "install:file-storage": "cd packages/file-storage && npm install",
    "install:search": "cd packages/search && npm install",
    "install:feature-flags": "cd packages/feature-flags && npm install",
    "install:health": "cd packages/health && npm install",
    "install:config": "cd packages/config && npm install",
    "install:backup": "cd packages/backup && npm install",
    "install:queue": "cd packages/queue && npm install",
    "install:notifications": "cd packages/notifications && npm install",
    "build:packages": "npm run build:core && npm run build:infrastructure && npm run build:security && npm run build:monitoring && npm run build:validation && npm run build:shared && npm run build:audit && npm run build:rate-limiting && npm run build:file-storage && npm run build:search && npm run build:feature-flags && npm run build:health && npm run build:config && npm run build:backup && npm run build:queue && npm run build:notifications",
    "build:core": "cd packages/core && npm run build",
    "build:infrastructure": "cd packages/infrastructure && npm run build",
    "build:security": "cd packages/security && npm run build",
    "build:monitoring": "cd packages/monitoring && npm run build",
    "build:validation": "cd packages/validation && npm run build",
    "build:shared": "cd packages/shared && npm run build",
    "build:audit": "cd packages/audit && npm run build",
    "build:rate-limiting": "cd packages/rate-limiting && npm run build",
    "build:file-storage": "cd packages/file-storage && npm run build",
    "build:search": "cd packages/search && npm run build",
    "build:feature-flags": "cd packages/feature-flags && npm run build",
    "build:health": "cd packages/health && npm run build",
    "build:config": "cd packages/config && npm run build",
    "build:backup": "cd packages/backup && npm run build",
    "build:queue": "cd packages/queue && npm run build",
    "build:notifications": "cd packages/notifications && npm run build",
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:monitoring\"",
    "dev:api": "cd services/api && npm run start:dev",
    "dev:monitoring": "cd monitoring && npm run start",
    "start:prod": "cd services/api && npm run start:prod",
    "test": "npm run test:packages && npm run test:api",
    "test:packages": "cd packages && npm test",
    "test:api": "cd services/api && npm test",
    "test:integration": "cd tests && npm run integration",
    "test:e2e": "cd tests && npm run e2e",
    "lint": "eslint . --ext .ts,.js",
    "format": "prettier --write \"**/*.{ts,js,json,md}\"",
    "clean": "npm run clean:packages && npm run clean:api",
    "clean:packages": "find packages -name node_modules -type d -exec rm -rf {} + && find packages -name dist -type d -exec rm -rf {} +",
    "clean:api": "cd services/api && rm -rf node_modules dist"
  }
}
```

## 🐳 Docker Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: ./services/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/system_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=system_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  postgres_data:
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **Database connection**: Check DATABASE_URL and ensure PostgreSQL is running
3. **Package dependencies**: Run `npm run install:packages`
4. **Build errors**: Check TypeScript configuration in each package
5. **Memory issues**: Increase Node.js memory limit: `NODE_OPTIONS="--max-old-space-size=4096"`

### Debug Mode

```bash
# Enable debug logging
DEBUG=system:* npm run dev

# API debug mode
cd services/api && npm run start:debug
```

### Performance Monitoring

```bash
# Monitor API performance
curl http://localhost:3000/metrics | grep http_request_duration

# Check system health
curl http://localhost:3000/health | jq
```

This setup provides a complete enterprise-grade system with proper build processes, configuration management, and monitoring capabilities.