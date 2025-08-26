# @system/core

Enterprise-grade core package providing essential building blocks for modular backend services.

## 🎯 Overview

The core package centralizes all common functionality that services need, following DDD principles and providing a consistent foundation across the entire system.

## 📦 What's Included

### Domain Primitives
- **Entity** - Base entity with identity
- **AggregateRoot** - Domain event handling
- **ValueObject** - Immutable value objects
- **DomainEvent** - Event-driven architecture
- **Repository** - Data access interfaces

### Common Patterns
- **Result** - Functional error handling
- **Guard** - Input validation utilities
- **Mapper** - Data transformation
- **Logger** - Structured logging system
- **Cache** - Caching abstractions

### DTOs & Validation
- **BaseDto** - Standard DTO patterns
- **PaginationDto** - Pagination support
- **ResponseDto** - Standardized API responses

### Services
- **BaseService** - Common service functionality
- **CryptoService** - Encryption & hashing
- **DateService** - Date manipulation
- **ValidationService** - Input validation

### Utils & Helpers
- **StringUtils** - String manipulation
- **ObjectUtils** - Object operations
- **ArrayUtils** - Array utilities
- **CryptoUtils** - Cryptographic functions
- **DateUtils** - Date formatting

### Adapters
- **DatabaseAdapter** - Database abstraction
- **CacheAdapter** - Cache abstraction
- **EmailAdapter** - Email service abstraction
- **StorageAdapter** - File storage abstraction

### Decorators
- **@Retry** - Automatic retry logic
- **@Cache** - Method-level caching
- **@Log** - Automatic logging

## 🚀 Quick Start

```typescript
import { 
  BaseService, 
  Result, 
  Logger,
  StringUtils,
  CryptoService 
} from '@system/core';

class UserService extends BaseService {
  constructor() {
    super('UserService');
  }

  async createUser(email: string, password: string): Promise<Result<User>> {
    // Validate input
    if (!StringUtils.isEmail(email)) {
      return Result.fail('Invalid email format');
    }

    // Hash password
    const hashResult = await CryptoService.hashPassword(password);
    if (hashResult.isFailure) {
      return Result.fail('Password hashing failed');
    }

    // Execute with logging
    return this.executeWithLogging('createUser', async () => {
      const user = User.create({
        email,
        passwordHash: hashResult.getValue()
      });
      
      await this.userRepository.save(user);
      return user;
    }, { email });
  }
}
```

## 📋 Usage Examples

### Result Pattern
```typescript
import { Result } from '@system/core';

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return Result.fail('Division by zero');
  }
  return Result.ok(a / b);
}

const result = divide(10, 2);
if (result.isSuccess) {
  console.log(result.getValue()); // 5
}
```

### String Utils
```typescript
import { StringUtils } from '@system/core';

const slug = StringUtils.slugify('Hello World!'); // 'hello-world'
const masked = StringUtils.mask('1234567890', 4); // '******7890'
const camel = StringUtils.toCamelCase('user-name'); // 'userName'
```

### Object Utils
```typescript
import { ObjectUtils } from '@system/core';

const merged = ObjectUtils.deepMerge(
  { a: 1, b: { c: 2 } },
  { b: { d: 3 } }
); // { a: 1, b: { c: 2, d: 3 } }

const picked = ObjectUtils.pick(user, ['id', 'email']); // { id: '...', email: '...' }
```

### Retry Decorator
```typescript
import { Retry, RetryConditions } from '@system/core';

class ApiService {
  @Retry({
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: RetryConditions.networkError
  })
  async fetchData(): Promise<any> {
    // This method will retry on network errors
    return await this.httpClient.get('/api/data');
  }
}
```

### Cache Decorator
```typescript
import { CacheDecorator } from '@system/core';

class UserService {
  @CacheDecorator.cache({ ttl: 300 }) // 5 minutes
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  @CacheDecorator.invalidate('user:*')
  async updateUser(user: User): Promise<void> {
    await this.userRepository.save(user);
  }
}
```

### Pagination
```typescript
import { PaginationDto, PaginatedResponseDto } from '@system/core';

class UserController {
  async getUsers(query: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const users = await this.userService.findAll(query);
    const total = await this.userService.count();
    
    return new PaginatedResponseDto(users, total, query.page, query.limit);
  }
}
```

### Database Adapter
```typescript
import { BaseRepository, DatabaseAdapter } from '@system/core';

class UserRepository extends BaseRepository<User, string> {
  constructor(db: DatabaseAdapter) {
    super(db);
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    const result = await this.db.executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    return result.map(rows => rows[0] ? this.mapToEntity(rows[0]) : null);
  }
}
```

### Logging
```typescript
import { Logger } from '@system/core';

class OrderService {
  private logger = new Logger('OrderService');

  async processOrder(orderId: string): Promise<void> {
    this.logger.info('Processing order', { orderId });
    
    try {
      // Process order logic
      this.logger.info('Order processed successfully', { orderId });
    } catch (error) {
      this.logger.error('Order processing failed', { orderId, error });
      throw error;
    }
  }
}
```

## 🔧 Configuration

### Logger Setup
```typescript
import { Logger, ConsoleLoggerAdapter, LogLevel } from '@system/core';

// Configure logging
Logger.setMinLevel(LogLevel.INFO);
Logger.setGlobalContext({ service: 'user-service', version: '1.0.0' });
```

### Cache Configuration
```typescript
import { BaseCacheService, CacheAdapter } from '@system/core';

class UserCacheService extends BaseCacheService {
  constructor(cache: CacheAdapter) {
    super(cache, {
      prefix: 'user',
      ttl: 3600 // 1 hour default
    });
  }
}
```

## 🎨 Design Principles

- **Zero Dependencies on Services** - Core never imports from services
- **Modular & Composable** - Use only what you need
- **Type-Safe** - Full TypeScript support
- **Testable** - Easy to mock and test
- **Extensible** - Easy to extend with custom implementations
- **Performance-Focused** - Optimized for production use

## 📚 Advanced Usage

### Custom Adapters
```typescript
import { CacheAdapter, Result } from '@system/core';

class RedisCacheAdapter implements CacheAdapter {
  async get<T>(key: string): Promise<Result<T | null>> {
    // Redis implementation
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<Result<void>> {
    // Redis implementation
  }
}
```

### Custom Validators
```typescript
import { Guard } from '@system/core';

class CustomGuard extends Guard {
  static againstInvalidEmail(email: string, argumentName: string): void {
    if (!StringUtils.isEmail(email)) {
      throw new Error(`${argumentName} must be a valid email`);
    }
  }
}
```

The core package is designed to be the foundation that all services build upon, providing consistent patterns and utilities while maintaining zero coupling to business logic.