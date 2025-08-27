# 🚀 Complete System Setup Documentation

## 📋 Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

## 🔧 Installation Steps

### 1. Clone & Setup
```bash
git clone <repository-url>
cd SYSTEM
```

### 2. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings (optional - defaults work)
```

### 3. Quick Start
```bash
# Windows
quick-start.bat

# Linux/Mac
chmod +x quick-start.sh && ./quick-start.sh
```

## 🐳 Docker Services

### MySQL Database
- **Port**: 3307
- **Database**: system_db
- **User**: system_user
- **Password**: password
- **Root Password**: rootpassword

### Redis Cache
- **Port**: 6379
- **No authentication**

### API Service
- **Port**: 3001
- **Environment**: Development
- **Hot Reload**: Enabled

## 📊 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:3001 | Main API endpoint |
| Swagger | http://localhost:3001/api/docs | API documentation |
| Health | http://localhost:3001/health | Health check |

## 🛠️ Development Commands

```bash
# Start development environment
npm run dev

# Start services only
npm run start

# Stop all services
npm run stop

# Clean everything (removes volumes)
npm run clean

# Build packages only
npm run build

# Run tests
npm run test
```

## 📦 Package Structure

### Core Packages
- `@system/core` - Base functionality
- `@system/infrastructure` - Database & external services
- `@system/security` - Authentication & authorization
- `@system/monitoring` - Metrics & observability

### Feature Packages
- `@system/validation` - Data validation
- `@system/audit` - Audit logging
- `@system/events` - Event handling
- `@system/rate-limiting` - Rate limiting
- `@system/search` - Search functionality
- `@system/health` - Health monitoring
- `@system/backup` - Backup services
- `@system/config` - Configuration management
- `@system/queue` - Queue processing
- `@system/notifications` - Notification services
- `@system/feature-flags` - Feature toggles
- `@system/file-storage` - File management
- `@system/logging` - Logging services
- `@system/shared` - Shared utilities
- `@system/testing` - Testing utilities

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check if ports are in use
netstat -an | findstr :3001
netstat -an | findstr :3307
netstat -an | findstr :6379

# Kill processes if needed
docker-compose down
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d mysql
```

### Package Build Issues
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm run build
```

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:port/db
REDIS_URL=redis://host:port
JWT_SECRET=your-production-secret
```

### Docker Production
```bash
# Build production image
docker build -t system-api .

# Run production
docker run -p 3001:3001 --env-file .env.production system-api
```

## 📈 Monitoring & Health

### Health Endpoints
- `/health` - Basic health check
- `/health/detailed` - Detailed system status
- `/metrics` - Prometheus metrics

### Logging
- Console output in development
- File logging in production
- Structured JSON logs

## 🔐 Security Features

### Authentication
- JWT tokens with refresh
- Password hashing with bcrypt
- Role-based access control

### Security Headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection

## 📚 API Documentation

### Swagger UI
Access interactive API docs at: http://localhost:3001/api/docs

### Key Endpoints
```
POST /auth/login     - User authentication
POST /auth/register  - User registration
GET  /users         - List users
POST /users         - Create user
GET  /users/:id     - Get user by ID
PUT  /users/:id     - Update user
DELETE /users/:id   - Delete user
```

## 🧪 Testing

### Unit Tests
```bash
cd services/api
npm run test
```

### Integration Tests
```bash
cd services/api
npm run test:e2e
```

### API Testing
```bash
# Test basic endpoint
curl http://localhost:3001/health

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:3001/users
```

## 🔄 Development Workflow

1. **Start Services**: `npm run dev`
2. **Make Changes**: Edit code in `services/api/src/`
3. **Auto Reload**: Changes trigger automatic restart
4. **Test**: Use Swagger UI or curl
5. **Commit**: Git commit your changes

## 📋 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment mode |
| PORT | 3001 | API server port |
| DATABASE_URL | mysql://... | MySQL connection string |
| REDIS_URL | redis://... | Redis connection string |
| JWT_SECRET | change-me | JWT signing secret |
| JWT_EXPIRES_IN | 1h | JWT token expiry |
| LOG_LEVEL | debug | Logging level |
| CORS_ORIGIN | http://localhost:3002 | CORS allowed origin |
| SWAGGER_ENABLED | true | Enable Swagger docs |
| MAX_FILE_SIZE | 10485760 | Max upload size (10MB) |

## 🎯 Next Steps

1. **Customize**: Modify `services/api/src/` for your needs
2. **Add Features**: Use existing packages or create new ones
3. **Deploy**: Follow production deployment guide
4. **Monitor**: Set up monitoring and alerting
5. **Scale**: Convert to microservices when needed