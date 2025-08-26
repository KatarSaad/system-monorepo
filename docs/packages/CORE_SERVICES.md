# Core Services Documentation

## Overview

The core package provides essential services and utilities that form the foundation of the enterprise system.

## Services

### EventBusService

Domain event handling with subscriptions and middleware support.

#### Usage

```typescript
import { EventBusService, DomainEvent } from '@system/core';

const event: DomainEvent = {
  id: 'event-123',
  type: 'UserCreated',
  aggregateId: 'user-456',
  aggregateType: 'User',
  version: 1,
  occurredOn: new Date(),
  data: { name: 'John Doe' }
};

eventBus.publish(event);

const subscription = eventBus.subscribe('UserCreated', {
  handle: async (event) => console.log('User created:', event.data)
});
```

### CacheService

In-memory caching with TTL, tagging, and statistics.

#### Usage

```typescript
import { CacheService } from '@system/core';

await cache.set('user:123', userData, { ttl: 3600, tags: ['user'] });
const user = await cache.get<UserData>('user:123');
await cache.invalidateByTag('user');

const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

## Utilities

### PerformanceUtils

Performance monitoring and optimization utilities.

#### Usage

```typescript
import { PerformanceUtils } from '@system/shared';

const { result, metrics } = await PerformanceUtils.measure('operation', async () => {
  return await database.query('SELECT * FROM users');
});

const benchmarkResult = await PerformanceUtils.benchmark('sort', () => array.sort(), 1000);
```

## API Reference

### EventBusService
- `publish(event: DomainEvent): void`
- `subscribe<T>(eventType: string, handler: EventHandler<T>): EventSubscription`
- `subscribeToAll(handler: EventHandler): EventSubscription`
- `addMiddleware(middleware: Function): void`

### CacheService
- `get<T>(key: string): Promise<Result<T | null>>`
- `set<T>(key: string, value: T, options?: CacheOptions): Promise<Result<void>>`
- `invalidateByTag(tag: string): Promise<Result<number>>`
- `getStats(): CacheStats`

### PerformanceUtils
- `measure<T>(name: string, fn: () => Promise<T> | T): Promise<{ result: T; metrics: PerformanceMetrics }>`
- `benchmark<T>(name: string, fn: () => Promise<T> | T, iterations: number): Promise<BenchmarkResult>`
- `memoize<T>(func: T, keyGenerator?: Function): T`