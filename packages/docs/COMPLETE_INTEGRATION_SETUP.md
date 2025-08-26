# Complete Package Integration & Usage Guide

## Overview
This document provides comprehensive integration, usage, and implementation guidelines for all system packages with their utilities, decorators, and advanced features.

## Package Inventory & Utilities

### 📦 **@system/core**
**Main Services:** `CacheService`, `EventBusService`, `CryptoService`, `BaseService`
**Utilities:**
- `ArrayUtils` - chunk, unique, groupBy, sortBy, flatten, intersection, difference, shuffle, sample, partition
- `CryptoUtils` - hash, hmac, randomBytes, encrypt, decrypt, generateKeyPair, sign, verify
- `DateUtils` - format, addDays, addHours, isExpired, getAge, daysBetween, startOfDay, endOfDay
- `ObjectUtils` - deepClone, deepMerge, pick, omit, isEmpty, flatten, unflatten, getNestedValue
- `StringUtils` - isEmpty, toCamelCase, toKebabCase, capitalize, truncate, slugify, mask, isEmail, isUrl
**Common Classes:** `Guard`, `Mapper`, `Result`, `Logger`
**Decorators:** `@Retry`
**DTOs:** `BaseDto`, `PaginationDto`, `ApiResponseDto`
**Adapters:** `CacheAdapter`, `DatabaseAdapter`
**Swagger:** Complete API documentation decorators

### 📦 **@system/security**
**Main Services:** `EncryptionService`
**Features:** Password hashing, data encryption/decryption, secure token generation
**Interfaces:** `IEncryptionService`, `HashResult`

### 📦 **@system/validation**
**Main Services:** `ValidationService`, `AdvancedValidationService`
**Features:** Rule-based validation, schema validation, custom validators
**Interfaces:** `IValidationService`, `ValidationResult`, `ValidationError`
**Types:** `ValidationRule`, `ValidationRules`, `ValidatorFunction`

### 📦 **@system/monitoring**
**Main Services:** `MetricsService`
**Features:** Counters, gauges, histograms, health checks
**Interfaces:** `IMetricsService`, `CounterMetric`, `GaugeMetric`, `HistogramMetric`

### 📦 **@system/infrastructure**
**Main Services:** `PrismaService`, `RepositoryFactory`, `QueryBuilder`, `Infrastructure`
**Features:** Database abstraction, repository pattern, query building
**Repositories:** `BaseRepository`
**Interfaces:** `IRepository`

### 📦 **@system/audit**
**Main Services:** `AuditService`
**Decorators:** `@Auditable`
**Features:** Automatic audit logging, compliance reporting

### 📦 **@system/search**
**Main Services:** `SearchService`
**Features:** Full-text search, indexing, filtering

### 📦 **@system/rate-limiting**
**Main Services:** `RateLimiterService`
**Guards:** `RateLimitGuard`
**Features:** Request rate limiting, IP-based limiting

### 📦 **@system/health**
**Main Services:** `HealthService`
**Features:** Health checks, dependency monitoring

### 📦 **@system/file-storage**
**Main Services:** `FileStorageService`
**Adapters:** `LocalAdapter`
**Features:** File upload, storage abstraction

### 📦 **@system/notifications**
**Main Services:** `NotificationService`
**Features:** Email, SMS, push notifications

### 📦 **@system/shared**
**Utilities:**
- `FileUtils` - getExtension, formatSize, isImage, isVideo, sanitizeFilename, getMimeType
- `NumberUtils` - format, round, clamp, random
- `PerformanceUtils` - timing, profiling

## Complete Integration Example

### 1. Module Setup
```typescript
import { Module } from '@nestjs/common';
import {
  CoreModule,
  SecurityModule,
  ValidationModule,
  AuditModule,
  SearchModule,
  RateLimitingModule,
  MonitoringModule,
  InfrastructureModule,
  HealthModule,
  FileStorageModule,
  NotificationModule,
} from '@system/*';

@Module({
  imports: [
    // Core services with configuration
    CoreModule.forRoot({
      cache: {
        ttl: 3600,
        maxSize: 10000,
        cleanupInterval: 300000,
      },
    }),
    
    // Security with encryption options
    SecurityModule.forRoot({
      hashing: {
        rounds: 12,
        algorithm: 'bcrypt',
      },
      encryption: {
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2',
      },
    }),
    
    // Validation with custom validators
    ValidationModule.forRoot({
      defaultLocale: 'en',
      customValidators: new Map([
        ['strongPassword', (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)],
        ['phoneNumber', (value) => /^\+?[\d\s\-\(\)]+$/.test(value)],
        ['creditCard', (value) => /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(value)],
      ]),
      errorMessages: new Map([
        ['strongPassword', 'Password must contain uppercase, lowercase, and number'],
        ['phoneNumber', 'Invalid phone number format'],
      ]),
    }),
    
    // Monitoring with metrics configuration
    MonitoringModule.forRoot({
      metrics: {
        enabled: true,
        prefix: 'myapp',
        defaultLabels: { service: 'api', version: '1.0.0' },
        exportInterval: 15000,
      },
    }),
    
    // Other modules
    AuditModule,
    SearchModule,
    RateLimitingModule,
    InfrastructureModule.forRoot(),
    HealthModule,
    FileStorageModule,
    NotificationModule,
  ],
})
export class AppModule {}
```

### 2. Comprehensive Service Implementation
```typescript
import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  ICacheService,
  EventBusService,
  CryptoService,
  BaseService,
  Result,
  Guard,
  Mapper,
  ArrayUtils,
  CryptoUtils,
  DateUtils,
  ObjectUtils,
  StringUtils,
  Retry,
  RetryConditions,
} from '@system/core';
import { IEncryptionService } from '@system/security';
import { IValidationService, AdvancedValidationService } from '@system/validation';
import { AuditService, Auditable } from '@system/audit';
import { SearchService } from '@system/search';
import { IMetricsService } from '@system/monitoring';
import { PrismaService, RepositoryFactory, QueryBuilder } from '@system/infrastructure';
import { HealthService } from '@system/health';
import { FileStorageService } from '@system/file-storage';
import { NotificationService } from '@system/notifications';
import { RateLimiterService } from '@system/rate-limiting';
import { FileUtils } from '@system/shared';

@Injectable()
export class ComprehensiveService extends BaseService {
  private readonly logger = new Logger(ComprehensiveService.name);
  private readonly queryBuilder: QueryBuilder<any>;

  constructor(
    @Inject('ICacheService') private cacheService: ICacheService,
    @Inject('IEncryptionService') private encryptionService: IEncryptionService,
    @Inject('IValidationService') private validationService: IValidationService,
    @Inject('IMetricsService') private metricsService: IMetricsService,
    private eventBus: EventBusService,
    private cryptoService: CryptoService,
    private advancedValidationService: AdvancedValidationService,
    private auditService: AuditService,
    private searchService: SearchService,
    private prismaService: PrismaService,
    private repositoryFactory: RepositoryFactory,
    private healthService: HealthService,
    private fileStorageService: FileStorageService,
    private notificationService: NotificationService,
    private rateLimiterService: RateLimiterService,
  ) {
    super();
    this.queryBuilder = this.repositoryFactory.createQueryBuilder('users');
    this.initializeHealthChecks();
    this.initializeMetrics();
  }

  @Retry({
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: RetryConditions.networkError,
  })
  @Auditable('CREATE', 'user')
  async createUser(userData: any, request: any): Promise<Result<any>> {
    const startTime = Date.now();
    
    try {
      // 1. Input sanitization using StringUtils
      const sanitizedData = {
        ...userData,
        email: StringUtils.trim(StringUtils.toLowerCase(userData.email)),
        name: StringUtils.trim(userData.name),
        phone: userData.phone ? StringUtils.trim(userData.phone) : undefined,
      };

      // 2. Guard validations
      Guard.againstNullOrUndefined(sanitizedData.email, 'email');
      Guard.againstNullOrUndefined(sanitizedData.name, 'name');
      Guard.againstEmpty(sanitizedData.email, 'email');
      Guard.againstAtLeast(2, sanitizedData.name, 'name');

      // 3. Rate limiting
      const rateLimitKey = this.rateLimiterService.generateKey(request, 'create_user');
      const rateLimitResult = await this.rateLimiterService.checkLimit(rateLimitKey, {
        windowMs: 60000,
        maxRequests: 5,
      });

      if (!rateLimitResult.allowed) {
        this.metricsService.incrementCounter('user_create_rate_limited');
        return Result.fail('Rate limit exceeded');
      }

      // 4. Advanced validation
      const validationResult = await this.advancedValidationService.validateSchema(sanitizedData, {
        email: { type: 'string', required: true, rules: ['email'] },
        name: { type: 'string', required: true, rules: ['minLength'] },
        password: { type: 'string', required: true, rules: ['strongPassword'] },
        phone: { type: 'string', required: false, rules: ['phoneNumber'] },
        age: { type: 'number', required: false, rules: ['min'] },
      });

      if (!validationResult.isValid) {
        this.metricsService.incrementCounter('user_create_validation_failed');
        return Result.fail(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      // 5. Check for duplicates using cache and database
      const emailCacheKey = `user:email:${CryptoUtils.hash(sanitizedData.email)}`;
      const cachedUser = await this.cacheService.get(emailCacheKey);
      
      if (cachedUser.isSuccess && cachedUser.value) {
        return Result.fail('Email already exists');
      }

      // Database check using QueryBuilder
      const existingUser = await this.queryBuilder
        .where({ email: sanitizedData.email })
        .findFirst();

      if (existingUser.isSuccess && existingUser.value) {
        return Result.fail('Email already exists in database');
      }

      // 6. Password encryption
      const hashResult = await this.encryptionService.hashPassword(sanitizedData.password);
      if (hashResult.isFailure) {
        return Result.fail('Password encryption failed');
      }

      // 7. Generate secure IDs and tokens
      const userId = CryptoUtils.randomString(16);
      const verificationToken = await this.encryptionService.generateSecureToken(32);

      // 8. Create user object with utilities
      const now = DateUtils.now();
      const user = ObjectUtils.deepClone({
        id: userId,
        email: sanitizedData.email,
        name: sanitizedData.name,
        phone: sanitizedData.phone,
        passwordHash: hashResult.value.hash,
        passwordSalt: hashResult.value.salt,
        verificationToken: verificationToken.isSuccess ? verificationToken.value : undefined,
        isVerified: false,
        isActive: true,
        metadata: {
          createdFrom: request.ip,
          userAgent: request.headers?.['user-agent'],
          registrationDate: DateUtils.toISOString(now),
        },
        createdAt: now,
        updatedAt: now,
        version: 1,
      });

      // 9. Store in database (mock)
      // await this.prismaService.user.create({ data: user });

      // 10. Multi-level caching with tags
      const cacheOperations = new Map([
        [`user:${userId}`, ObjectUtils.omit(user, ['passwordHash', 'passwordSalt'])],
        [emailCacheKey, true],
        [`user:verification:${verificationToken.value}`, userId],
      ]);

      await this.cacheService.mset(cacheOperations, {
        ttl: 3600,
        tags: ['users', 'verification'],
      });

      // 11. Search indexing
      await this.searchService.index('users', userId, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        searchableText: StringUtils.concatenate([user.name, user.email], ' '),
        createdAt: DateUtils.toISOString(user.createdAt),
      });

      // 12. File storage for user avatar placeholder
      const avatarPath = `users/${userId}/avatar.png`;
      await this.fileStorageService.store(avatarPath, 'placeholder-avatar-data');

      // 13. Send verification email
      if (verificationToken.isSuccess) {
        await this.notificationService.send({
          to: user.email,
          subject: 'Verify your account',
          template: 'email-verification',
          data: {
            name: user.name,
            verificationUrl: `https://app.com/verify?token=${verificationToken.value}`,
          },
        });
      }

      // 14. Publish domain event
      this.eventBus.publish({
        id: CryptoUtils.randomString(16),
        type: 'UserRegistered',
        aggregateId: userId,
        aggregateType: 'User',
        version: 1,
        occurredOn: user.createdAt,
        data: ObjectUtils.pick(user, ['id', 'email', 'name']),
        metadata: {
          correlationId: CryptoUtils.randomString(12),
          causationId: request.headers?.['x-request-id'],
          userId: request.user?.id,
        },
      });

      // 15. Comprehensive metrics
      const duration = Date.now() - startTime;
      this.metricsService.incrementCounter('user_create_success', 1, {
        hasPhone: user.phone ? 'true' : 'false',
        source: 'api',
      });
      this.metricsService.observeHistogram('user_create_duration', duration);
      this.metricsService.setGauge('total_users', await this.getTotalUserCount());

      // 16. Return sanitized response
      const response = ObjectUtils.omit(user, ['passwordHash', 'passwordSalt', 'verificationToken']);
      return Result.ok(response);

    } catch (error) {
      this.logger.error('User creation failed', error);
      this.metricsService.incrementCounter('user_create_error');
      return Result.fail(`User creation failed: ${error.message}`);
    }
  }

  async uploadUserAvatar(userId: string, file: any): Promise<Result<string>> {
    try {
      // File validation using FileUtils
      const extension = FileUtils.getExtension(file.originalname);
      const fileName = FileUtils.sanitizeFilename(file.originalname);
      
      if (!FileUtils.isImage(fileName)) {
        return Result.fail('File must be an image');
      }

      // Generate secure file path
      const timestamp = DateUtils.format(new Date(), 'yyyyMMdd_HHmmss');
      const secureFileName = `${userId}_${timestamp}.${extension}`;
      const filePath = FileUtils.joinPath('users', userId, 'avatars', secureFileName);

      // Store file
      const storeResult = await this.fileStorageService.store(filePath, file.buffer);
      if (storeResult.isFailure) {
        return Result.fail('File storage failed');
      }

      // Update user record
      await this.updateUserAvatar(userId, filePath);

      // Clear user cache
      await this.cacheService.delete(`user:${userId}`);

      this.metricsService.incrementCounter('user_avatar_uploaded');
      return Result.ok(filePath);

    } catch (error) {
      this.logger.error('Avatar upload failed', error);
      return Result.fail(`Avatar upload failed: ${error.message}`);
    }
  }

  async searchUsers(query: string, filters: any = {}): Promise<Result<any>> {
    try {
      // Use ArrayUtils for processing filters
      const activeFilters = ObjectUtils.removeUndefined(filters);
      const searchTags = query ? ArrayUtils.unique(query.split(' ').filter(Boolean)) : [];

      // Search with advanced options
      const searchResult = await this.searchService.search('users', query, {
        filters: activeFilters,
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
      });

      if (searchResult.isFailure) {
        return Result.fail(searchResult.error);
      }

      // Process results with utilities
      const processedResults = searchResult.value.hits.map(hit => ({
        ...hit,
        relevanceScore: hit.score,
        highlightedName: StringUtils.truncate(hit.name, 50),
        memberSince: DateUtils.format(new Date(hit.createdAt), 'yyyy-MM-dd'),
      }));

      // Group results if needed
      const groupedResults = filters.groupBy 
        ? ArrayUtils.groupBy(processedResults, filters.groupBy)
        : processedResults;

      this.metricsService.incrementCounter('user_search_performed');
      return Result.ok({
        results: groupedResults,
        total: searchResult.value.total,
        query,
        filters: activeFilters,
        searchTags,
      });

    } catch (error) {
      this.logger.error('User search failed', error);
      return Result.fail(`Search failed: ${error.message}`);
    }
  }

  private async initializeHealthChecks(): void {
    // Database health check
    this.healthService.registerCheck({
      name: 'database',
      check: async () => {
        try {
          await this.prismaService.$queryRaw`SELECT 1`;
          return {
            status: 'healthy',
            message: 'Database connection successful',
            details: { provider: 'postgresql' },
          };
        } catch (error) {
          return {
            status: 'unhealthy',
            message: 'Database connection failed',
            details: { error: error.message },
          };
        }
      },
      timeout: 5000,
      critical: true,
    });

    // Cache health check
    this.healthService.registerCheck({
      name: 'cache',
      check: async () => {
        try {
          const testKey = 'health_check_' + Date.now();
          await this.cacheService.set(testKey, 'test', { ttl: 10 });
          const result = await this.cacheService.get(testKey);
          await this.cacheService.delete(testKey);
          
          return {
            status: result.isSuccess ? 'healthy' : 'unhealthy',
            message: 'Cache operation successful',
          };
        } catch (error) {
          return {
            status: 'unhealthy',
            message: 'Cache operation failed',
            details: { error: error.message },
          };
        }
      },
    });
  }

  private initializeMetrics(): void {
    // User-related metrics
    this.metricsService.createCounter('user_create_success', 'Successful user creations');
    this.metricsService.createCounter('user_create_validation_failed', 'Failed user validations');
    this.metricsService.createCounter('user_create_rate_limited', 'Rate limited user creations');
    this.metricsService.createCounter('user_create_error', 'User creation errors');
    this.metricsService.createCounter('user_avatar_uploaded', 'User avatar uploads');
    this.metricsService.createCounter('user_search_performed', 'User searches performed');
    
    this.metricsService.createGauge('total_users', 'Total number of users');
    
    this.metricsService.createHistogram(
      'user_create_duration',
      'User creation duration in milliseconds',
      [10, 50, 100, 500, 1000, 2000, 5000]
    );
  }

  private async getTotalUserCount(): Promise<number> {
    // Mock implementation
    return 1000;
  }

  private async updateUserAvatar(userId: string, avatarPath: string): Promise<void> {
    // Mock implementation
    this.logger.debug(`Updated avatar for user ${userId}: ${avatarPath}`);
  }
}
```

### 3. Controller with All Decorators
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiStandardOperation,
  ApiCreateOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiPaginatedOperation,
  ApiFileUpload,
  ApiPaginationQuery,
  ApiSearchQuery,
  ApiBulkOperation,
} from '@system/core';
import { RateLimitGuard } from '@system/rate-limiting';

@Controller('users')
@ApiTags('Users')
@UseGuards(RateLimitGuard)
export class UsersController {
  constructor(private readonly userService: ComprehensiveService) {}

  @Post()
  @ApiCreateOperation(UserResponseDto, 'Create new user', 'Register a new user account')
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    const result = await this.userService.createUser(createUserDto, req);
    
    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return ApiResponseDto.success(result.value, 'User created successfully');
  }

  @Get(':id')
  @ApiStandardOperation('Get user by ID', 'Retrieve user information by ID')
  async getUserById(@Param('id') id: string) {
    // Implementation
  }

  @Put(':id')
  @ApiUpdateOperation(UserResponseDto, 'Update user', 'Update user information')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // Implementation
  }

  @Delete(':id')
  @ApiDeleteOperation('Delete user', 'Delete user account')
  async deleteUser(@Param('id') id: string) {
    // Implementation
  }

  @Get()
  @ApiPaginatedOperation(UserResponseDto, 'List users', 'Get paginated list of users')
  @ApiPaginationQuery()
  @ApiSearchQuery()
  async getUsers(@Query() query: any) {
    return await this.userService.searchUsers(query.search, query);
  }

  @Post(':id/avatar')
  @ApiFileUpload('Upload user avatar', 'Upload and set user profile picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: any) {
    const result = await this.userService.uploadUserAvatar(id, file);
    
    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return ApiResponseDto.success({ avatarUrl: result.value }, 'Avatar uploaded successfully');
  }

  @Post('bulk')
  @ApiBulkOperation(UserResponseDto, 'bulk', 'Bulk user operations', 'Perform bulk operations on multiple users')
  async bulkOperation(@Body() bulkDto: BulkOperationDto) {
    // Implementation
  }
}
```

### 4. Testing Strategy
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule, SecurityModule, ValidationModule } from '@system/*';

describe('ComprehensiveService', () => {
  let service: ComprehensiveService;
  let cacheService: ICacheService;
  let encryptionService: IEncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoreModule.forRoot({ cache: { ttl: 300 } }),
        SecurityModule.forRoot(),
        ValidationModule.forRoot(),
        // ... other modules
      ],
      providers: [ComprehensiveService],
    }).compile();

    service = module.get<ComprehensiveService>(ComprehensiveService);
    cacheService = module.get<ICacheService>('ICacheService');
    encryptionService = module.get<IEncryptionService>('IEncryptionService');
  });

  describe('createUser', () => {
    it('should create user with all validations', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'StrongPass123!',
        phone: '+1234567890',
      };

      const mockRequest = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      };

      const result = await service.createUser(userData, mockRequest);
      
      expect(result.isSuccess).toBe(true);
      expect(result.value.email).toBe(userData.email);
      expect(result.value.passwordHash).toBeUndefined(); // Should be omitted
    });

    it('should fail validation for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'weak',
      };

      const result = await service.createUser(userData, {});
      
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Password must contain');
    });
  });

  describe('utilities integration', () => {
    it('should use ArrayUtils correctly', () => {
      const array = [1, 2, 2, 3, 4, 4, 5];
      const unique = ArrayUtils.unique(array);
      expect(unique).toEqual([1, 2, 3, 4, 5]);
    });

    it('should use StringUtils correctly', () => {
      const email = '  TEST@EXAMPLE.COM  ';
      const cleaned = StringUtils.trim(StringUtils.toLowerCase(email));
      expect(cleaned).toBe('test@example.com');
    });

    it('should use ObjectUtils correctly', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const picked = ObjectUtils.pick(obj, ['a', 'c']);
      expect(picked).toEqual({ a: 1, c: 3 });
    });
  });
});
```

## Key Integration Points

### 1. **Dependency Injection Tokens**
```typescript
// Use string tokens for interfaces
@Inject('ICacheService') private cacheService: ICacheService
@Inject('IEncryptionService') private encryptionService: IEncryptionService
@Inject('IValidationService') private validationService: IValidationService
@Inject('IMetricsService') private metricsService: IMetricsService
```

### 2. **Error Handling Pattern**
```typescript
// Always use Result<T> pattern
const result = await someOperation();
if (result.isFailure) {
  this.metricsService.incrementCounter('operation_failed');
  return Result.fail(result.error);
}
return Result.ok(result.value);
```

### 3. **Utility Usage Patterns**
```typescript
// String operations
const cleaned = StringUtils.trim(StringUtils.toLowerCase(input));
const slug = StringUtils.slugify(title);
const masked = StringUtils.mask(creditCard, 4);

// Array operations
const unique = ArrayUtils.unique(tags);
const grouped = ArrayUtils.groupBy(users, 'department');
const sorted = ArrayUtils.sortBy(items, 'createdAt', 'desc');

// Object operations
const cloned = ObjectUtils.deepClone(original);
const merged = ObjectUtils.deepMerge(target, source);
const picked = ObjectUtils.pick(user, ['id', 'name', 'email']);

// Date operations
const formatted = DateUtils.format(date, 'yyyy-MM-dd HH:mm:ss');
const future = DateUtils.addDays(new Date(), 30);
const age = DateUtils.getAge(birthDate);

// Crypto operations
const hash = CryptoUtils.hash(data);
const encrypted = CryptoUtils.encrypt(sensitive, key);
const token = CryptoUtils.randomString(32);
```

### 4. **Decorator Usage**
```typescript
// Retry with conditions
@Retry({
  maxAttempts: 3,
  backoff: 'exponential',
  retryCondition: RetryConditions.networkError,
})

// Audit logging
@Auditable('CREATE', 'user')

// API documentation
@ApiCreateOperation(UserDto, 'Create user')
@ApiPaginationQuery()
```

### 5. **Health Checks & Metrics**
```typescript
// Register health checks
this.healthService.registerCheck({
  name: 'service_name',
  check: async () => ({ status: 'healthy', message: 'OK' }),
  timeout: 5000,
  critical: true,
});

// Metrics collection
this.metricsService.createCounter('operation_count', 'Operation counter');
this.metricsService.incrementCounter('operation_count', 1, { type: 'success' });
this.metricsService.observeHistogram('operation_duration', duration);
```

This comprehensive guide demonstrates how to leverage all package utilities, decorators, and advanced features in a real-world application scenario.