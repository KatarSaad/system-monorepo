# System API - Enterprise User Management

A production-ready, enterprise-grade API service built with NestJS, featuring comprehensive user management, authentication, authorization, and monitoring capabilities.

## 🚀 Features

### Core Features
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Role-Based Access Control (RBAC)** - Fine-grained permission system
- **User Management** - Complete CRUD operations with profiles
- **Session Management** - Multi-session support with device tracking
- **Rate Limiting** - Configurable API protection
- **Audit Logging** - Comprehensive activity tracking
- **Health Monitoring** - System health checks and metrics
- **Caching** - Redis-based caching with TTL and tagging
- **Search** - Full-text search capabilities
- **File Storage** - Multi-provider file management
- **Feature Flags** - Dynamic feature toggles
- **Backup & Recovery** - Automated data protection

### Security Features
- **Password Security** - Scrypt hashing with unique salts
- **Account Lockout** - Brute force protection
- **Session Security** - Secure session management
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Configurable cross-origin policies
- **Rate Limiting** - DDoS and abuse protection

### Enterprise Features
- **Metrics & Monitoring** - Prometheus-compatible metrics
- **Event-Driven Architecture** - Domain events for loose coupling
- **Bulk Operations** - Efficient batch processing
- **Advanced Validation** - Schema-based validation framework
- **Performance Tracking** - Request duration monitoring
- **Error Handling** - Structured error responses

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- npm or yarn

## 🛠️ Installation

1. **Clone and Install**
   ```bash
   cd services/api
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/system_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV="development"
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/logout-all
GET  /api/v1/auth/profile
```

### User Management Endpoints

```http
GET    /api/v1/users              # List users (Admin/Moderator)
POST   /api/v1/users              # Create user (Admin)
GET    /api/v1/users/stats        # User statistics (Admin)
GET    /api/v1/users/:id          # Get user (RBAC)
PATCH  /api/v1/users/:id          # Update user (RBAC)
DELETE /api/v1/users/:id          # Delete user (Admin)
POST   /api/v1/users/bulk         # Bulk operations (Admin)
GET    /api/v1/users/:id/profile  # Get user profile (RBAC)
```

### Health & Monitoring

```http
GET /api/v1/health          # Basic health check
GET /api/v1/health/detailed # Detailed health check
GET /api/v1/health/metrics  # System metrics
```

## 🔐 Authentication Flow

### Registration
```typescript
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "USER"
}
```

### Login
```typescript
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

### Response
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  },
  "message": "Login successful"
}
```

## 👥 Role-Based Access Control

### Roles Hierarchy
- **SUPER_ADMIN** - Full system access
- **ADMIN** - User management and system configuration
- **MODERATOR** - User management (limited)
- **USER** - Own profile management
- **GUEST** - Read-only access

### Usage Example
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Post('users')
async createUser(@Body() dto: CreateUserDto) {
  // Only admins can create users
}
```

## 📊 Monitoring & Metrics

### Available Metrics
- Authentication metrics (login/register success/failure)
- User operation metrics (CRUD operations)
- API performance metrics (response times)
- Cache performance metrics (hit/miss ratios)
- Rate limiting metrics
- System health metrics

### Health Checks
- Database connectivity
- Redis connectivity
- Memory usage
- CPU usage
- Disk space

## 🔒 Security Features

### Password Security
- Scrypt hashing algorithm
- Unique salt per password
- Configurable work factor
- Timing-safe comparison

### Account Protection
- Failed login attempt tracking
- Account lockout after 5 failed attempts
- 30-minute lockout duration
- Rate limiting on login endpoints

### Session Security
- JWT with short expiration (15 minutes)
- Refresh token rotation
- Session tracking with device info
- Multi-session support

## 🚀 Performance Features

### Caching Strategy
- User data caching (1 hour TTL)
- Query result caching (5 minutes TTL)
- Tag-based cache invalidation
- Redis-based distributed caching

### Database Optimization
- Connection pooling
- Query performance monitoring
- Bulk operations support
- Indexed searches

### API Performance
- Request/response compression
- Pagination for large datasets
- Efficient bulk operations
- Performance metrics tracking

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📦 Database Schema

### Users Table
```sql
- id (CUID)
- email (unique)
- name
- passwordHash
- passwordSalt
- role (enum)
- isActive (boolean)
- isVerified (boolean)
- lastLoginAt
- loginAttempts
- lockedUntil
- createdAt
- updatedAt
- version
```

### Sessions Table
```sql
- id (CUID)
- userId (FK)
- accessToken (unique)
- refreshToken (unique)
- expiresAt
- isActive
- ipAddress
- userAgent
- createdAt
- updatedAt
```

### Audit Logs Table
```sql
- id (CUID)
- userId (FK)
- action
- resource
- resourceId
- oldValues (JSON)
- newValues (JSON)
- ipAddress
- userAgent
- metadata (JSON)
- timestamp
```

## 🔄 Event-Driven Architecture

### Domain Events
```typescript
// User Registration
{
  type: 'UserRegistered',
  data: { email, name, role }
}

// User Login
{
  type: 'UserLoggedIn',
  data: { email }
}

// User Updates
{
  type: 'UserUpdated',
  data: { changes, updatedBy }
}
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Stateless design
- Redis for shared state
- Event-driven architecture
- Database connection pooling

### Performance Optimization
- Caching at multiple levels
- Bulk operations for efficiency
- Async processing for heavy operations
- Monitoring and alerting

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Verify connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection**
   ```bash
   # Test Redis connection
   redis-cli ping
   ```

3. **JWT Issues**
   ```bash
   # Verify JWT secret is set
   echo $JWT_SECRET
   ```

### Logs
```bash
# View application logs
npm run start:dev

# Database query logs
# Set LOG_LEVEL=debug in .env
```

## 📞 Support

- Documentation: `/api/docs`
- Health Check: `/api/v1/health`
- Metrics: `/api/v1/health/metrics`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using the @system packages ecosystem**