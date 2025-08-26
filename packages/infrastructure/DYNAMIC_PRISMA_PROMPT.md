# Dynamic Prisma Infrastructure Tool - AI Prompt

## 🎯 Objective
Create a universal, entity-agnostic Prisma infrastructure tool that provides advanced database operations, caching, analytics, and monitoring for any application without hardcoded entity logic.

## 📋 Requirements

### Core Infrastructure Components
1. **Dynamic Repository Factory**
   - Auto-generate repositories for any Prisma model
   - Generic CRUD operations with full type safety
   - Advanced filtering, pagination, and search
   - Bulk operations and transactions
   - No entity-specific logic

2. **Universal Query Builder**
   - Fluent API for complex queries
   - Runtime schema introspection
   - Type-safe operations
   - Performance optimization
   - Query caching and optimization

3. **Smart Caching Layer**
   - Multi-level caching (memory, Redis, etc.)
   - Automatic cache invalidation
   - Relationship-aware caching
   - Cache warming strategies
   - Performance monitoring

4. **Analytics Engine**
   - Real-time metrics collection
   - Dynamic aggregations
   - Custom dashboard support
   - Automated reporting
   - Data visualization helpers

5. **Audit & Monitoring System**
   - Automatic change tracking
   - Performance monitoring
   - Error tracking and alerting
   - Compliance reporting
   - Security monitoring

### Technical Specifications

#### 1. Entity-Agnostic Design
```typescript
// Should work with ANY Prisma model
const repository = repositoryFactory.create<T>(modelName);
const analytics = analyticsEngine.forModel(modelName);
const cache = cacheManager.forModel(modelName);
```

#### 2. Configuration-Driven
```typescript
interface InfraConfig {
  database: DatabaseConfig;
  cache: CacheConfig;
  analytics: AnalyticsConfig;
  audit: AuditConfig;
  models: Record<string, ModelConfig>;
}
```

#### 3. Plugin Architecture
```typescript
interface InfraPlugin {
  name: string;
  install(infrastructure: Infrastructure): void;
  configure(config: any): void;
}
```

#### 4. Middleware Pipeline
```typescript
interface Middleware {
  before?(operation: Operation): Promise<void>;
  after?(operation: Operation, result: any): Promise<any>;
  error?(operation: Operation, error: Error): Promise<void>;
}
```

### Advanced Features Required

#### 1. Dynamic Schema Introspection
- Runtime model discovery
- Relationship mapping
- Field type detection
- Constraint analysis

#### 2. Intelligent Caching
- Automatic cache key generation
- Relationship-based invalidation
- Cache hit/miss analytics
- Memory usage optimization

#### 3. Performance Optimization
- Query analysis and optimization
- Connection pooling
- Lazy loading strategies
- Performance benchmarking

#### 4. Real-time Analytics
- Live metrics dashboard
- Custom KPI tracking
- Automated alerts
- Trend analysis

#### 5. Security & Compliance
- Automatic PII detection
- Data masking capabilities
- Access control integration
- Audit trail generation

### Implementation Guidelines

#### 1. Architecture Patterns
- Repository Pattern for data access
- Factory Pattern for dynamic creation
- Observer Pattern for events
- Strategy Pattern for different providers
- Decorator Pattern for middleware

#### 2. Type Safety
- Full TypeScript generics support
- Runtime type validation
- Schema-first development
- Auto-generated interfaces

#### 3. Error Handling
- Comprehensive exception hierarchy
- Graceful degradation
- Retry mechanisms
- Circuit breaker pattern

#### 4. Testing Strategy
- Unit tests for all components
- Integration tests with real database
- Performance benchmarks
- Load testing scenarios

### Usage Examples Required

#### 1. Basic Repository Usage
```typescript
const userRepo = infrastructure.repository<User>('user');
const users = await userRepo.findMany({
  where: { isActive: true },
  include: ['profile'],
  paginate: { page: 1, limit: 10 }
});
```

#### 2. Advanced Query Building
```typescript
const result = await infrastructure
  .query('user')
  .where({ role: 'admin' })
  .search({ query: 'john', fields: ['name', 'email'] })
  .include(['profile', 'permissions'])
  .orderBy({ createdAt: 'desc' })
  .paginate({ page: 1, limit: 20 })
  .cache({ ttl: 300, tags: ['users', 'admin'] })
  .execute();
```

#### 3. Analytics Integration
```typescript
const metrics = await infrastructure
  .analytics('user')
  .metrics(['count', 'growth_rate'])
  .groupBy(['role', 'status'])
  .dateRange({ from: startDate, to: endDate })
  .generate();
```

#### 4. Bulk Operations
```typescript
const result = await infrastructure
  .repository('user')
  .bulkUpdate(
    { role: 'user' },
    { isActive: false },
    { batchSize: 1000 }
  );
```

### Performance Requirements
- Support for 10,000+ concurrent operations
- Sub-100ms response time for cached queries
- Memory usage under 500MB for 1M records
- 99.9% uptime with graceful degradation

### Integration Requirements
- NestJS module integration
- Express middleware support
- Standalone library usage
- Docker containerization
- Kubernetes deployment

### Documentation Requirements
- Comprehensive API documentation
- Usage examples for all features
- Performance benchmarks
- Migration guides
- Best practices guide

## 🚀 Deliverables Expected

1. **Core Infrastructure Package**
   - Dynamic repository factory
   - Universal query builder
   - Smart caching system
   - Analytics engine
   - Audit system

2. **Configuration System**
   - YAML/JSON configuration
   - Environment variable support
   - Runtime configuration updates
   - Validation schemas

3. **Plugin System**
   - Plugin interface definition
   - Core plugins (Redis, Elasticsearch, etc.)
   - Plugin registry
   - Hot-swappable plugins

4. **Monitoring Dashboard**
   - Real-time metrics
   - Performance graphs
   - Error tracking
   - Usage analytics

5. **Documentation Package**
   - API reference
   - Usage guides
   - Architecture documentation
   - Performance tuning guide

## 🎯 Success Criteria

1. **Functionality**: All core features working with any Prisma model
2. **Performance**: Meets all performance benchmarks
3. **Usability**: Simple API with comprehensive documentation
4. **Reliability**: 99.9% uptime with proper error handling
5. **Scalability**: Handles enterprise-level workloads
6. **Maintainability**: Clean, well-documented, testable code

## 🔧 Technical Constraints

- Must work with Prisma 5.x+
- TypeScript 5.x+ support
- Node.js 18+ compatibility
- Support for MySQL, PostgreSQL, SQLite
- Redis integration for caching
- Prometheus metrics export
- Docker deployment ready

## 📊 Expected File Structure
```
packages/infrastructure/
├── src/
│   ├── core/
│   │   ├── repository-factory.ts
│   │   ├── query-builder.ts
│   │   ├── cache-manager.ts
│   │   └── analytics-engine.ts
│   ├── interfaces/
│   ├── exceptions/
│   ├── middleware/
│   ├── plugins/
│   ├── utils/
│   └── index.ts
├── docs/
├── examples/
├── tests/
└── README.md
```

This prompt should generate a production-ready, enterprise-grade infrastructure tool that can be used across multiple applications without any entity-specific dependencies.