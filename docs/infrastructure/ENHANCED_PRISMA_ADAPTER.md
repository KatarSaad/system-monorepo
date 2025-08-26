# Enhanced Prisma Database Adapter

A comprehensive, enterprise-grade Prisma adapter with advanced features including metrics, retry logic, bulk operations, health checks, and comprehensive error handling.

## Features

- **Advanced Connection Management** - Connection pooling, timeouts, and health checks
- **Query Metrics & Monitoring** - Performance tracking and slow query detection
- **Retry Logic** - Configurable retry mechanisms for failed operations
- **Bulk Operations** - Efficient batch create, update, and delete operations
- **Pagination Support** - Built-in pagination with metadata
- **Transaction Management** - Advanced transaction handling with isolation levels
- **Health Monitoring** - Database health checks and connection status
- **Comprehensive Logging** - Detailed query logging and error tracking

## Installation

```bash
npm install @prisma/client
npm install @nestjs/common # for Logger
```

## Basic Usage

```typescript
import { PrismaClient } from '@prisma/client';
import { EnhancedPrismaDatabaseAdapter } from '@system/infrastructure';

const prisma = new PrismaClient();
const adapter = new EnhancedPrismaDatabaseAdapter(prisma, {
  enableLogging: true,
  enableMetrics: true,
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  slowQueryThreshold: 1000,
  onQueryLog: (query, params, duration) => {
    console.log(`Query: ${query} (${duration}ms)`, params);
  },
  onError: (error, context) => {
    console.error(`Database error in ${context}:`, error);
  },
  onSlowQuery: (query, duration) => {
    console.warn(`Slow query detected: ${query} (${duration}ms)`);
  }
});

await adapter.connect();
```

## Advanced Operations

### Paginated Queries

```typescript
const result = await adapter.findMany('user', 
  { where: { active: true } },
  { page: 1, limit: 10, orderBy: { createdAt: 'desc' } }
);

if (result.isSuccess) {
  const { data, total, hasNext, hasPrev } = result.value;
  console.log(`Found ${data.length} of ${total} users`);
}
```

### Bulk Operations

```typescript
// Bulk create
const users = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
];

const bulkResult = await adapter.bulkCreate('user', users);
if (bulkResult.isSuccess) {
  const { created, failed, errors } = bulkResult.value;
  console.log(`Created: ${created}, Failed: ${failed}`);
}

// Bulk update
const updates = [
  { id: 1, data: { name: 'John Updated' } },
  { id: 2, data: { name: 'Jane Updated' } }
];

const updateResult = await adapter.bulkUpdate('user', updates);
```

### Transactions with Options

```typescript
const operations = [
  () => adapter.create('user', { name: 'John' }),
  () => adapter.create('profile', { userId: 1, bio: 'Developer' })
];

const transactionResult = await adapter.executeTransaction(operations, {
  isolationLevel: 'ReadCommitted',
  maxWait: 5000,
  timeout: 10000
});
```

### Aggregations and Grouping

```typescript
// Aggregate
const stats = await adapter.aggregate('order', {
  _sum: { amount: true },
  _avg: { amount: true },
  _count: { id: true },
  where: { status: 'completed' }
});

// Group by
const grouped = await adapter.groupBy('order', {
  by: ['status'],
  _count: { id: true },
  _sum: { amount: true }
});
```

### Health Monitoring

```typescript
const health = await adapter.healthCheck();
if (health.isSuccess) {
  const { isHealthy, latency, connectionPool } = health.value;
  console.log(`Database healthy: ${isHealthy}, Latency: ${latency}ms`);
}

// Get performance metrics
const metrics = adapter.getMetrics();
console.log(`Total queries: ${metrics.totalQueries}`);
console.log(`Average query time: ${metrics.averageQueryTime}ms`);
console.log(`Slow queries: ${metrics.slowQueries}`);
```

## Configuration Options

```typescript
interface PrismaAdapterOptions {
  enableLogging?: boolean;           // Enable query logging
  enableMetrics?: boolean;           // Enable performance metrics
  enableRetry?: boolean;             // Enable retry logic
  maxRetries?: number;               // Maximum retry attempts (default: 3)
  retryDelay?: number;               // Delay between retries in ms (default: 1000)
  connectionTimeout?: number;        // Connection timeout in ms (default: 10000)
  queryTimeout?: number;             // Query timeout in ms (default: 30000)
  slowQueryThreshold?: number;       // Slow query threshold in ms (default: 1000)
  onQueryLog?: (query: string, params?: any[], duration?: number) => void;
  onError?: (error: unknown, context?: string) => void;
  onSlowQuery?: (query: string, duration: number) => void;
}
```

## API Reference

### Core Methods

- `connect(): Promise<Result<void>>` - Establish database connection
- `disconnect(): Promise<Result<void>>` - Close database connection
- `isConnected(): boolean` - Check connection status
- `executeQuery<T>(query: string, params?: any[]): Promise<Result<T[]>>` - Execute raw SQL
- `executeTransaction<T>(operations: (() => Promise<T>)[], options?: TransactionOptions): Promise<Result<T[]>>` - Execute transaction

### CRUD Operations

- `findMany<T>(model: string, args?: any, pagination?: PaginationOptions): Promise<Result<PaginatedResult<T>>>` - Find multiple records with pagination
- `findById<T>(model: string, id: string | number): Promise<Result<T | null>>` - Find record by ID
- `create<T>(model: string, data: any): Promise<Result<T>>` - Create single record
- `update<T>(model: string, id: string | number, data: any): Promise<Result<T>>` - Update record by ID
- `delete<T>(model: string, id: string | number): Promise<Result<T>>` - Delete record by ID
- `upsert<T>(model: string, where: any, create: any, update: any): Promise<Result<T>>` - Upsert record

### Bulk Operations

- `bulkCreate<T>(model: string, data: any[]): Promise<Result<BulkOperationResult>>` - Bulk create records
- `bulkUpdate<T>(model: string, updates: Array<{ id: string | number; data: any }>): Promise<Result<BulkOperationResult>>` - Bulk update records

### Analytics

- `aggregate<T>(model: string, args: any): Promise<Result<T>>` - Aggregate data
- `groupBy<T>(model: string, args: any): Promise<Result<T[]>>` - Group data

### Monitoring

- `healthCheck(): Promise<Result<HealthCheckResult>>` - Check database health
- `getMetrics(): QueryMetrics` - Get performance metrics
- `resetMetrics(): void` - Reset performance metrics

## Types

### PaginatedResult<T>
```typescript
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### BulkOperationResult
```typescript
interface BulkOperationResult {
  created: number;
  updated: number;
  deleted: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}
```

### QueryMetrics
```typescript
interface QueryMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  connectionCount: number;
}
```

### HealthCheckResult
```typescript
interface HealthCheckResult {
  isHealthy: boolean;
  latency: number;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  lastError?: string;
}
```

## Best Practices

1. **Connection Management**: Always call `connect()` before operations and `disconnect()` when done
2. **Error Handling**: Use the Result pattern for consistent error handling
3. **Metrics Monitoring**: Enable metrics in production for performance monitoring
4. **Bulk Operations**: Use bulk operations for better performance with large datasets
5. **Transactions**: Use transactions for operations that must succeed or fail together
6. **Health Checks**: Implement regular health checks for monitoring
7. **Query Optimization**: Monitor slow queries and optimize accordingly

## Performance Tips

- Enable connection pooling in Prisma Client configuration
- Use pagination for large result sets
- Implement proper indexing in your database schema
- Monitor and optimize slow queries
- Use bulk operations for batch processing
- Configure appropriate timeouts for your use case