# Deployment Guide

## 🚀 Deployment Overview

The system supports multiple deployment strategies from development to production environments.

## 🐳 Docker Deployment

### Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: enterprise_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Production Environment

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

### Dockerfile

```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## ☸️ Kubernetes Deployment

### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: enterprise-system
```

### Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: enterprise-system
  namespace: enterprise-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: enterprise-system
  template:
    metadata:
      labels:
        app: enterprise-system
    spec:
      containers:
      - name: app
        image: enterprise-system:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: enterprise-system-service
  namespace: enterprise-system
spec:
  selector:
    app: enterprise-system
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: enterprise-system-ingress
  namespace: enterprise-system
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: enterprise-system-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: enterprise-system-service
            port:
              number: 80
```

## 🔧 Environment Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/enterprise_system

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# CORS
CORS_ORIGIN=https://yourdomain.com

# Swagger
SWAGGER_ENABLED=false
```

### Secrets Management

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: enterprise-system
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  redis-url: <base64-encoded-redis-url>
```

## 📊 Monitoring & Observability

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'enterprise-system'
    static_configs:
      - targets: ['enterprise-system-service:3000']
    metrics_path: '/api/metrics'
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Enterprise System Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t enterprise-system:${{ github.sha }} .
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push enterprise-system:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/enterprise-system app=enterprise-system:${{ github.sha }}
          kubectl rollout status deployment/enterprise-system
```

## 🚀 Deployment Commands

### Development
```bash
# Start development environment
npm run docker:up
npm run dev

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## 🔍 Health Checks

### Application Health
```typescript
@Get('health')
async healthCheck(): Promise<HealthStatus> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      memory: this.checkMemory()
    }
  };
}
```

### Kubernetes Probes
- **Liveness Probe**: `/api/health`
- **Readiness Probe**: `/api/health/ready`
- **Startup Probe**: `/api/health/startup`