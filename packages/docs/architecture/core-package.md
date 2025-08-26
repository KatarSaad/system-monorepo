# @system/core Package Architecture

## Overview
Core foundational services and utilities for the entire system.

## Current Structure
```
src/
├── common/          # Shared utilities (Result, Logger, Guard)
├── domain/          # DDD building blocks (Entity, AggregateRoot, ValueObject)
├── services/        # Core services (Cache, EventBus, Crypto)
├── dto/            # Base DTOs and response patterns
├── utils/          # Utility functions
├── adapters/       # Interface adapters
├── decorators/     # Common decorators
├── swagger/        # API documentation helpers
└── core.module.ts  # NestJS module
```

## Architecture Principles

### 1. **Single Responsibility**
- Each service handles one concern
- Clear separation between domain and infrastructure

### 2. **Open/Closed Principle**
- Services are open for extension via interfaces
- Closed for modification through abstractions

### 3. **Dependency Inversion**
- Depend on abstractions, not concretions
- Use interfaces for all external dependencies

## Best Practices

### ✅ **Module Structure**
```typescript
@Global()
@Module({
  providers: [
    CacheService,
    EventBusService,
    CryptoService,
  ],
  exports: [
    CacheService,
    EventBusService,
    CryptoService,
  ],
})
export class CoreModule {}
```

### ✅ **Service Pattern**
```typescript
@Injectable()
export class CacheService {
  async get<T>(key: string): Promise<Result<T | null>> {
    // Implementation returns Result pattern
  }
}
```

### ✅ **Result Pattern**
```typescript
// Always return Result<T> for error handling
return Result.ok(data);
return Result.fail('Error message');
```

## Transformation Guidelines

### 1. **Interface Segregation**
```typescript
// Create specific interfaces
interface ICacheService {
  get<T>(key: string): Promise<Result<T | null>>;
  set<T>(key: string, value: T): Promise<Result<void>>;
}

// Implement in service
@Injectable()
export class CacheService implements ICacheService {
  // Implementation
}
```

### 2. **Configuration Pattern**
```typescript
// Add configuration support
export interface CoreModuleOptions {
  cache?: {
    ttl: number;
    maxSize: number;
  };
}

@Module({})
export class CoreModule {
  static forRoot(options?: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: 'CORE_OPTIONS',
          useValue: options,
        },
        CacheService,
      ],
      exports: [CacheService],
    };
  }
}
```

### 3. **Error Handling**
```typescript
// Consistent error handling
try {
  const result = await operation();
  return Result.ok(result);
} catch (error) {
  this.logger.error('Operation failed', error);
  return Result.fail(`Operation failed: ${error.message}`);
}
```

## Usage Examples

### ✅ **Correct Usage**
```typescript
@Module({
  imports: [CoreModule.forRoot({ cache: { ttl: 3600 } })],
})
export class AppModule {}
```

### ❌ **Incorrect Usage**
```typescript
@Module({
  providers: [CacheService], // Manual registration
})
export class AppModule {}
```

## Future Enhancements

1. **Add Health Checks** - Service health monitoring
2. **Add Metrics** - Performance tracking
3. **Add Circuit Breaker** - Fault tolerance
4. **Add Retry Logic** - Resilience patterns

## Testing Strategy

```typescript
describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CoreModule],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should cache and retrieve values', async () => {
    const result = await service.set('key', 'value');
    expect(result.isSuccess).toBe(true);
  });
});
```