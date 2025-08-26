import { Injectable, Inject } from '@nestjs/common';
import {
  ICacheService,
  EventBusService,
  Result,
  Logger,
  Guard,
  ArrayUtils,
  CryptoUtils,
  DateUtils,
  ObjectUtils,
  StringUtils,
} from '@katarsaad/core';
import { IEncryptionService } from '@katarsaad/security';
import {
  IValidationService,
  ValidationService,
  AdvancedValidationService,
} from '@katarsaad/validation';
import { AuditService } from '@katarsaad/audit';
import { SearchService } from '@katarsaad/search';
import { IMetricsService } from '@katarsaad/monitoring';
import { PrismaService, RepositoryFactory } from '@katarsaad/infrastructure';
import { RateLimiterService } from '@katarsaad/rate-limiting';
import {
  CreateExampleDto,
  UpdateExampleDto,
  SearchExampleDto,
  ExampleResponseDto,
} from '../dto/example.dto';

@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);
  private readonly examples = new Map<string, any>();

  constructor(
    @Inject('ICacheService') private cacheService: ICacheService,
    @Inject('IEncryptionService') private encryptionService: IEncryptionService,
    @Inject('IValidationService') private validationService: IValidationService,
    @Inject('IMetricsService') private metricsService: IMetricsService,
    private eventBus: EventBusService,
    private auditService: AuditService,
    private searchService: SearchService,
    private advancedValidationService: AdvancedValidationService,
    private rateLimiterService: RateLimiterService,
  ) {
    // Set logger to show debug messages
    Logger.setMinLevel(3); // DEBUG level
    this.logger.info('ExampleService initialized');
    this.initializeMetrics();
  }

  async create(
    createDto: CreateExampleDto,
    userId: string,
  ): Promise<Result<ExampleResponseDto>> {
    const startTime = Date.now();
    this.logger.info('Creating new example', { userId, email: createDto.email });

    try {
      // 1. Basic validation (mock implementation)
      if (!createDto.name || createDto.name.trim().length < 2) {
        this.logger.warn('Validation failed: Invalid name', { name: createDto.name, userId });
        this.metricsService.incrementCounter('example_create_validation_failed');
        return Result.fail('Name is required and must be at least 2 characters');
      }
      if (!createDto.email || !createDto.email.includes('@')) {
        this.metricsService.incrementCounter('example_create_validation_failed');
        return Result.fail('Valid email is required');
      }
      if (!createDto.password || createDto.password.length < 6) {
        this.metricsService.incrementCounter('example_create_validation_failed');
        return Result.fail('Password must be at least 6 characters');
      }
      if (!createDto.age || createDto.age < 1) {
        this.metricsService.incrementCounter('example_create_validation_failed');
        return Result.fail('Age must be a positive number');
      }

      // 2. Check cache for existing email
      const cacheKey = `example:email:${createDto.email}`;
      const cached = await this.cacheService.get(cacheKey);
      if (cached.isSuccess && cached.value) {
        this.logger.warn('Duplicate email attempt', { email: createDto.email, userId });
        this.metricsService.incrementCounter('example_create_duplicate_email');
        return Result.fail('Email already exists');
      }

      // 3. Encrypt password
      const hashResult = await this.encryptionService.hashPassword(
        createDto.password,
      );
      if (hashResult.isFailure) {
        this.metricsService.incrementCounter(
          'example_create_encryption_failed',
        );
        return Result.fail('Password encryption failed');
      }

      // 4. Create example
      const id = this.generateId();
      const example = {
        id,
        name: createDto.name,
        email: createDto.email,
        age: createDto.age,
        passwordHash: hashResult.value.hash,
        tags: createDto.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.examples.set(id, example);
      this.logger.debug('Example created in memory', { id, name: example.name });

      // 5. Cache the example
      await this.cacheService.set(`example:${id}`, example, {
        ttl: 3600,
        tags: ['examples'],
      });
      await this.cacheService.set(cacheKey, true, { ttl: 3600 });

      // 6. Index for search
      await this.searchService.indexDocument('examples', {
        id: example.id,
        name: example.name,
        email: example.email,
        age: example.age,
        tags: example.tags,
        createdAt: example.createdAt,
      });

      // 7. Publish event
      this.eventBus.publish({
        id: this.generateEventId(),
        type: 'ExampleCreated',
        aggregateId: id,
        aggregateType: 'Example',
        version: 1,
        occurredOn: new Date(),
        data: { id, name: example.name, email: example.email },
      });

      // 8. Audit log
      await this.auditService.log({
        userId,
        action: 'CREATE',
        resource: 'example',
        resourceId: id,
        newValues: {
          name: example.name,
          email: example.email,
          age: example.age,
        },
        timestamp: new Date(),
      });

      // 9. Metrics
      this.metricsService.incrementCounter('example_create_success');
      this.metricsService.observeHistogram(
        'example_create_duration',
        Date.now() - startTime,
      );

      const response: ExampleResponseDto = {
        id: example.id,
        name: example.name,
        email: example.email,
        age: example.age,
        tags: example.tags,
        createdAt: example.createdAt,
        updatedAt: example.updatedAt,
      };

      const duration = Date.now() - startTime;
      this.logger.info('Example created successfully', { 
        id: example.id, 
        userId, 
        duration: `${duration}ms` 
      });
      
      return Result.ok(response);
    } catch (error) {
      this.logger.error('Failed to create example', { 
        error: error.message, 
        stack: error.stack, 
        userId, 
        email: createDto.email 
      });
      this.metricsService.incrementCounter('example_create_error');
      return Result.fail(`Create failed: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Result<ExampleResponseDto | null>> {
    this.logger.debug('Finding example by ID', { id });
    try {
      // 1. Check cache first
      const cached = await this.cacheService.get<any>(`example:${id}`);
      if (cached.isSuccess && cached.value) {
        this.logger.debug('Example found in cache', { id });
        this.metricsService.incrementCounter('example_find_cache_hit');
        return Result.ok(this.mapToResponse(cached.value));
      }

      // 2. Get from storage
      const example = this.examples.get(id);
      if (!example) {
        this.logger.warn('Example not found', { id });
        this.metricsService.incrementCounter('example_find_not_found');
        return Result.ok(null);
      }

      // 3. Cache the result
      await this.cacheService.set(`example:${id}`, example, {
        ttl: 3600,
        tags: ['examples'],
      });

      this.logger.debug('Example found in storage', { id, name: example.name });
      this.metricsService.incrementCounter('example_find_success');
      return Result.ok(this.mapToResponse(example));
    } catch (error) {
      this.logger.error('Failed to find example', { 
        error: error.message, 
        id, 
        stack: error.stack 
      });
      this.metricsService.incrementCounter('example_find_error');
      return Result.fail(`Find failed: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateDto: UpdateExampleDto,
    userId: string,
  ): Promise<Result<ExampleResponseDto>> {
    try {
      // 1. Basic validation (mock implementation)
      if (updateDto.name && updateDto.name.trim().length < 2) {
        this.metricsService.incrementCounter('example_update_validation_failed');
        return Result.fail('Name must be at least 2 characters');
      }
      if (updateDto.email && !updateDto.email.includes('@')) {
        this.metricsService.incrementCounter('example_update_validation_failed');
        return Result.fail('Valid email is required');
      }
      if (updateDto.age && updateDto.age < 1) {
        this.metricsService.incrementCounter('example_update_validation_failed');
        return Result.fail('Age must be a positive number');
      }

      // 2. Get existing example
      const existing = this.examples.get(id);
      if (!existing) {
        this.metricsService.incrementCounter('example_update_not_found');
        return Result.fail('Example not found');
      }

      // 3. Update example
      const oldValues = { ...existing };
      const updated = {
        ...existing,
        ...updateDto,
        updatedAt: new Date(),
      };

      this.examples.set(id, updated);

      // 4. Update cache
      await this.cacheService.set(`example:${id}`, updated, {
        ttl: 3600,
        tags: ['examples'],
      });

      // 5. Update search index
      await this.searchService.indexDocument('examples', {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        age: updated.age,
        tags: updated.tags,
        updatedAt: updated.updatedAt,
      });

      // 6. Audit log
      await this.auditService.log({
        userId,
        action: 'UPDATE',
        resource: 'example',
        resourceId: id,
        oldValues,
        newValues: updateDto,
        timestamp: new Date(),
      });

      // 7. Publish event
      this.eventBus.publish({
        id: this.generateEventId(),
        type: 'ExampleUpdated',
        aggregateId: id,
        aggregateType: 'Example',
        version: 2,
        occurredOn: new Date(),
        data: { id, changes: updateDto },
      });

      this.metricsService.incrementCounter('example_update_success');
      return Result.ok(this.mapToResponse(updated));
    } catch (error) {
      this.logger.error(`Failed to update example ${id}`, error);
      this.metricsService.incrementCounter('example_update_error');
      return Result.fail(`Update failed: ${error.message}`);
    }
  }

  async search(
    searchDto: SearchExampleDto,
  ): Promise<Result<{ results: ExampleResponseDto[]; total: number }>> {
    this.logger.info('Searching examples', { 
      query: searchDto.query, 
      page: searchDto.page, 
      limit: searchDto.limit 
    });
    try {
      // Use actual SearchService
      const searchResult = await this.searchService.search('examples', {
        query: searchDto.query,
        filters: searchDto.filters,
        page: searchDto.page || 1,
        limit: searchDto.limit || 10,
        sort: 'createdAt:desc',
      });

      if (searchResult.isFailure) {
        this.metricsService.incrementCounter('example_search_failed');
        return Result.fail(searchResult.error);
      }

      // Map search results to response DTOs
      const results = searchResult.value.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        age: item.age,
        tags: item.tags || [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || item.createdAt,
      }));

      this.logger.info('Search completed successfully', { 
        query: searchDto.query, 
        resultsCount: results.length, 
        total: searchResult.value.total 
      });
      this.metricsService.incrementCounter('example_search_success');
      return Result.ok({
        results,
        total: searchResult.value.total,
      });
    } catch (error) {
      this.logger.error('Failed to search examples', { 
        error: error.message, 
        query: searchDto.query, 
        stack: error.stack 
      });
      this.metricsService.incrementCounter('example_search_error');
      return Result.fail(`Search failed: ${error.message}`);
    }
  }

  async delete(id: string, userId: string): Promise<Result<void>> {
    try {
      const existing = this.examples.get(id);
      if (!existing) {
        this.metricsService.incrementCounter('example_delete_not_found');
        return Result.fail('Example not found');
      }

      // 1. Delete from storage
      this.examples.delete(id);

      // 2. Remove from cache
      await this.cacheService.delete(`example:${id}`);
      await this.cacheService.delete(`example:email:${existing.email}`);

      // 3. Search index will be rebuilt on next search (no delete method available)

      // 4. Audit log
      await this.auditService.log({
        userId,
        action: 'DELETE',
        resource: 'example',
        resourceId: id,
        oldValues: existing,
        timestamp: new Date(),
      });

      // 5. Publish event
      this.eventBus.publish({
        id: this.generateEventId(),
        type: 'ExampleDeleted',
        aggregateId: id,
        aggregateType: 'Example',
        version: 3,
        occurredOn: new Date(),
        data: { id },
      });

      this.metricsService.incrementCounter('example_delete_success');
      return Result.ok();
    } catch (error) {
      this.logger.error(`Failed to delete example ${id}`, error);
      this.metricsService.incrementCounter('example_delete_error');
      return Result.fail(`Delete failed: ${error.message}`);
    }
  }

  async clearCache(): Promise<Result<void>> {
    try {
      const result = await this.cacheService.invalidateByTag('examples');
      if (result.isFailure) {
        return Result.fail(result.error);
      }

      this.metricsService.incrementCounter('example_cache_cleared');
      return Result.ok();
    } catch (error) {
      this.logger.error('Failed to clear cache', error);
      return Result.fail(`Cache clear failed: ${error.message}`);
    }
  }

  private mapToResponse(example: any): ExampleResponseDto {
    return {
      id: example.id,
      name: example.name,
      email: example.email,
      age: example.age,
      tags: example.tags,
      createdAt: example.createdAt,
      updatedAt: example.updatedAt,
    };
  }

  private generateId(): string {
    return `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics(): void {
    this.metricsService.createCounter(
      'example_create_success',
      'Successful example creations',
    );
    this.metricsService.createCounter(
      'example_create_validation_failed',
      'Failed example creation validations',
    );
    this.metricsService.createCounter(
      'example_create_duplicate_email',
      'Duplicate email attempts',
    );
    this.metricsService.createCounter(
      'example_create_encryption_failed',
      'Failed password encryptions',
    );
    this.metricsService.createCounter(
      'example_create_error',
      'Example creation errors',
    );

    this.metricsService.createCounter(
      'example_find_success',
      'Successful example finds',
    );
    this.metricsService.createCounter(
      'example_find_cache_hit',
      'Example cache hits',
    );
    this.metricsService.createCounter(
      'example_find_not_found',
      'Example not found',
    );
    this.metricsService.createCounter(
      'example_find_error',
      'Example find errors',
    );

    this.metricsService.createCounter(
      'example_update_success',
      'Successful example updates',
    );
    this.metricsService.createCounter(
      'example_update_validation_failed',
      'Failed example update validations',
    );
    this.metricsService.createCounter(
      'example_update_not_found',
      'Example update not found',
    );
    this.metricsService.createCounter(
      'example_update_error',
      'Example update errors',
    );

    this.metricsService.createCounter(
      'example_search_success',
      'Successful example searches',
    );
    this.metricsService.createCounter(
      'example_search_failed',
      'Failed example searches',
    );
    this.metricsService.createCounter(
      'example_search_error',
      'Example search errors',
    );

    this.metricsService.createCounter(
      'example_delete_success',
      'Successful example deletions',
    );
    this.metricsService.createCounter(
      'example_delete_not_found',
      'Example delete not found',
    );
    this.metricsService.createCounter(
      'example_delete_error',
      'Example delete errors',
    );

    this.metricsService.createCounter(
      'example_cache_cleared',
      'Example cache clears',
    );

    // Histogram will be created automatically when first observed
    // this.metricsService.createHistogram is not available, using observeHistogram instead
  }
}
