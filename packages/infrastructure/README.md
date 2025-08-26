# Dynamic Prisma Infrastructure

A universal, entity-agnostic infrastructure layer that provides advanced database operations, caching, analytics, and monitoring capabilities for any Prisma-based application.

## 🚀 Features

- **Dynamic Repository Factory** - Auto-generates repositories for any Prisma model
- **Universal Query Builder** - Fluent API for complex queries with type safety
- **Smart Caching Layer** - Multi-level caching with automatic invalidation
- **Real-time Analytics** - Dynamic metrics collection and reporting
- **Audit & Monitoring** - Comprehensive tracking and compliance features

## 📦 Installation

```bash
npm install @system/infrastructure
```

## 🎯 Quick Start

### Basic Setup

```typescript
import { createInfrastructure } from '@system/infrastructure';

const infrastructure = createInfrastructure({
  database: {
    url: process.env.DATABASE_URL,
    provider: 'mysql'
  },
  cache: {
    provider: 'memory',
    ttl: 3600
  },
  analytics: {
    enabled: true,
    retention: 90
  },
  audit: {
    enabled: true,
    exclude: ['password', 'token']
  },
  models: {
    user: {
      cache: { ttl: 1800, tags: ['user', 'auth'] },
      search: { fields: ['name', 'email'] }
    }
  }
});

await infrastructure.initialize();
```

### Repository Usage

```typescript
// Works with ANY Prisma model
const userRepo = infrastructure.repository<User>('user');
const orderRepo = infrastructure.repository<Order>('order');

// Standard CRUD operations
const user = await userRepo.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// Advanced operations
const users = await userRepo.findMany({
  where: { isActive: true },
  include: { profile: true },
  page: 1,
  limit: 10
});

// Search functionality
const searchResults = await userRepo.search({
  query: 'john',
  fields: ['name', 'email'],
  page: 1,
  limit: 10
});

// Bulk operations
await userRepo.bulkUpdate(['id1', 'id2'], { isActive: false });

// Statistics
const stats = await userRepo.getStats({
  groupBy: ['role'],
  dateRange: { from: startDate, to: endDate }
});
```

### Query Builder Usage

```typescript
// Fluent API for complex queries
const result = await infrastructure
  .query<User>('user')
  .where({ isActive: true })
  .whereIn('role', ['admin', 'moderator'])
  .include(['profile', 'permissions'])
  .search({ query: 'john', fields: ['name', 'email'] })
  .orderBy({ createdAt: 'desc' })
  .paginate({ page: 1, limit: 20 })
  .cache({ ttl: 300, tags: ['users'] })
  .executeWithPagination();

// Aggregations
const totalUsers = await infrastructure
  .query('user')
  .where({ isActive: true })
  .count();

const avgAge = await infrastructure
  .query('user')
  .where({ isActive: true })
  .avg('age');
```

### Caching

```typescript
const cache = infrastructure.cache();

// Basic caching
await cache.set('user:123', userData, { ttl: 3600 });
const user = await cache.get<User>('user:123');

// Tag-based invalidation
await cache.invalidateByTag('user');

// Pattern-based invalidation
await cache.invalidateByPattern('user:*');

// Cache statistics
const stats = await cache.getStats();
```

### Transactions

```typescript
await infrastructure.transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: 'John', email: 'john@example.com' }
  });
  
  await tx.profile.create({
    data: { userId: user.id, bio: 'Software developer' }
  });
});
```

## 🏗️ Architecture

### Entity-Agnostic Design
The infrastructure layer contains no hardcoded entity logic. It works with any Prisma model through:

- Runtime schema introspection
- Generic interfaces and abstractions
- Dynamic model discovery
- Type-safe operations

### Separation of Concerns
- **Infrastructure Layer**: Database operations, caching, monitoring
- **Domain Layer**: Business logic (in your application)
- **Application Layer**: Use cases and orchestration

### Modular Architecture
```
@system/infrastructure
├── core/
│   ├── infrastructure.ts      # Main orchestrator
│   ├── repository-factory.ts  # Dynamic repository creation
│   └── query-builder.ts       # Universal query builder
├── interfaces/
│   └── repository.interface.ts # Generic interfaces
├── services/
│   ├── cache.service.ts       # Caching layer
│   └── prisma.service.ts      # Database service
└── exceptions/
    └── infrastructure.exceptions.ts # Error handling
```

## 🔧 Configuration

### Full Configuration Example

```typescript
const config = {
  database: {
    url: process.env.DATABASE_URL,
    provider: 'mysql',
    pool: {
      min: 5,
      max: 20
    }
  },
  cache: {
    provider: 'redis',
    url: process.env.REDIS_URL,
    ttl: 3600
  },
  analytics: {
    enabled: true,
    retention: 90
  },
  audit: {
    enabled: true,
    exclude: ['password', 'token', 'secret']
  },
  models: {
    user: {
      cache: { ttl: 1800, tags: ['user', 'auth'] },
      audit: { track: ['email', 'role', 'status'] },
      search: { fields: ['name', 'email', 'username'] }
    },
    order: {
      cache: { ttl: 900, tags: ['order', 'commerce'] },
      audit: { track: ['status', 'total', 'items'] },
      search: { fields: ['orderNumber', 'customerEmail'] }
    }
  }
};
```

## 📊 Monitoring & Health Checks

```typescript
// Health check
const health = await infrastructure.healthCheck();
console.log(health);
// {
//   status: 'healthy',
//   database: true,
//   cache: true,
//   timestamp: '2024-01-01T00:00:00.000Z'
// }

// System metrics
const metrics = await infrastructure.getMetrics();
console.log(metrics);
// {
//   cache: { hits: 1500, misses: 200, hitRate: 88.24 },
//   models: { available: ['user', 'order'], count: 2 },
//   uptime: 3600,
//   memory: { heapUsed: 50000000 }
// }
```

## 🔒 Error Handling

The infrastructure provides comprehensive error handling:

```typescript
import { 
  DatabaseException, 
  NotFoundExceptionInfra, 
  CacheException 
} from '@system/infrastructure';

try {
  const user = await userRepo.findById('invalid-id');
} catch (error) {
  if (error instanceof NotFoundExceptionInfra) {
    console.log('User not found');
  } else if (error instanceof DatabaseException) {
    console.log('Database error:', error.details);
  }
}
```

## 🚀 Advanced Usage

### Custom Repository Extensions

```typescript
// Extend the base repository for specific needs
class UserRepository extends DynamicRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { email },
      include: { profile: true }
    });
  }
}
```

### Plugin System (Coming Soon)

```typescript
// Custom plugins for extended functionality
const elasticsearchPlugin = new ElasticsearchPlugin({
  url: process.env.ELASTICSEARCH_URL
});

infrastructure.use(elasticsearchPlugin);
```

## 📈 Performance

- **Sub-100ms** response time for cached queries
- **10,000+** concurrent operations support
- **Memory efficient** with LRU cache eviction
- **Connection pooling** for optimal database usage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add comprehensive tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details