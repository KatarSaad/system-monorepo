# Complete System Exports Reference

## 🎯 Overview

This document provides a comprehensive reference of all available exports from the enterprise modular system packages, organized by functionality and use case.

## 📦 Package Exports

### @system/core

#### Domain Primitives
```typescript
import {
  Entity,
  AggregateRoot,
  ValueObject,
  DomainEvent,
  Repository
} from '@system/core';
```

#### Common Patterns
```typescript
import {
  Result,
  Logger,
  Mapper,
  Guard
} from '@system/core';
```

#### Services
```typescript
import {
  BaseService,
  CryptoService,
  EventBusService,
  CacheService
} from '@system/core';
```

#### DTOs
```typescript
import {
  BaseDto,
  PaginationDto,
  ResponseDto
} from '@system/core';
```

#### Utilities
```typescript
import {
  StringUtils,
  ObjectUtils,
  ArrayUtils,
  CryptoUtils,
  DateUtils
} from '@system/core';
```

#### Decorators
```typescript
import {
  Retry,
  Public,
  Cache
} from '@system/core';
```

#### Guards & Filters
```typescript
import {
  AuthGuard,
  GlobalExceptionFilter,
  LoggingInterceptor,
  CustomValidationPipe
} from '@system/core';
```

### @system/events

#### Event System
```typescript
import {
  EventBusService,
  MessageQueueService,
  EventStoreService,
  DomainEvent,
  EventHandler
} from '@system/events';
```

### @system/logging

#### Logging Services
```typescript
import {
  LoggingService,
  WinstonAdapter,
  PinoAdapter,
  LogLevel,
  LogContext
} from '@system/logging';
```

### @system/validation

#### Validation System
```typescript
import {
  ValidationService,
  AdvancedValidationService,
  ValidateAndTransform,
  Sanitize,
  IsStrongPassword,
  IsValidSlug,
  BaseEntitySchema,
  PaginationSchema,
  ContactSchema
} from '@system/validation';
```

### @system/security

#### Security Services
```typescript
import {
  EncryptionService,
  SecurityModule
} from '@system/security';
```

### @system/monitoring

#### Monitoring System
```typescript
import {
  MetricsService,
  MonitoringModule
} from '@system/monitoring';
```

### @system/infrastructure

#### Infrastructure Components
```typescript
import {
  Infrastructure,
  PrismaService,
  BaseRepository,
  DatabaseModule,
  InfrastructureModule
} from '@system/infrastructure';
```

### @system/system-module

#### Complete System
```typescript
import {
  SystemModule,
  // All other packages re-exported
} from '@system/system-module';
```

## 🚀 Usage Patterns

### Basic Service Implementation
```typescript
import { 
  BaseService, 
  Result, 
  Logger,
  EventBusService,
  ValidationService 
} from '@system/system-module';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private eventBus: EventBusService,
    private validator: ValidationService
  ) {
    super('UserService');
  }

  async createUser(data: CreateUserDto): Promise<Result<User>> {
    // Validation
    const validationResult = await this.validator.validate(data);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Business logic
    const user = User.create(data);
    
    // Event publishing
    await this.eventBus.publish({
      eventId: this.generateId(),
      eventType: 'UserCreated',
      aggregateId: user.id,
      version: 1,
      timestamp: new Date(),
      data: user.toJSON()
    });

    return Result.ok(user);
  }
}
```

### Complete Module Setup
```typescript
import { Module } from '@nestjs/common';
import { SystemModule } from '@system/system-module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [SystemModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
```

### Advanced Validation
```typescript
import { 
  ValidateAndTransform,
  IsStrongPassword,
  IsValidSlug,
  Sanitize 
} from '@system/validation';

export class CreateUserDto {
  @Sanitize()
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsValidSlug()
  username: string;
}

@Controller('users')
export class UserController {
  @Post()
  @ValidateAndTransform()
  async createUser(@Body() dto: CreateUserDto) {
    // Automatically validated and sanitized
  }
}
```

### Event-Driven Architecture
```typescript
import { EventBusService, EventHandler } from '@system/events';

@Injectable()
export class NotificationService {
  constructor(private eventBus: EventBusService) {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventBus.subscribe('UserCreated', this.handleUserCreated.bind(this));
    this.eventBus.subscribe('OrderPlaced', this.handleOrderPlaced.bind(this));
  }

  private async handleUserCreated(event: DomainEvent) {
    // Send welcome email
  }

  private async handleOrderPlaced(event: DomainEvent) {
    // Send order confirmation
  }
}
```

### Comprehensive Error Handling
```typescript
import { 
  GlobalExceptionFilter,
  LoggingInterceptor,
  AuthGuard,
  Result 
} from '@system/core';

@Controller('api')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@UseFilters(GlobalExceptionFilter)
export class ApiController {
  @Get('data')
  @Cache({ ttl: 300 })
  async getData(): Promise<Result<any>> {
    try {
      const data = await this.dataService.fetchData();
      return Result.ok(data);
    } catch (error) {
      return Result.fail('Failed to fetch data');
    }
  }
}
```

## 🎯 Best Practices

### Import Strategy
```typescript
// ✅ Recommended: Use system-module for everything
import { SystemModule, BaseService, Result } from '@system/system-module';

// ✅ Alternative: Import specific packages
import { BaseService } from '@system/core';
import { EventBusService } from '@system/events';

// ❌ Avoid: Deep imports
import { BaseService } from '@system/core/src/services/base.service';
```

### Module Organization
```typescript
// ✅ Clean module structure
@Module({
  imports: [
    SystemModule, // Provides all system functionality
    DatabaseModule.forRoot(config),
  ],
  providers: [MyService],
  controllers: [MyController],
})
export class MyModule {}
```

### Service Implementation
```typescript
// ✅ Follow the patterns
@Injectable()
export class MyService extends BaseService {
  constructor(
    private eventBus: EventBusService,
    private logger: LoggingService
  ) {
    super('MyService');
  }

  @Cache({ ttl: 300 })
  @Retry({ maxAttempts: 3 })
  async performOperation(): Promise<Result<any>> {
    return this.executeWithLogging('performOperation', async () => {
      // Implementation
    });
  }
}
```

This reference ensures you have access to all the enterprise-grade functionality provided by the modular system architecture.