// Domain exports
export * from './domain/entity';
export * from './domain/aggregate-root';
export * from './domain/value-object';
export * from './domain/domain-event';
export * from './domain/repository';
export * from './domain/ticket.entity';

// Common exports
export * from './common/result';
export * from './common/logger';
export * from './common/mapper';
export * from './common/guard';

// Services exports
export * from './services/base.service';
export * from './services/crypto.service';
export * from './services/ticket.service';
export * from './services/prisma-ticket.service';
export { EventBusService, DomainEvent as EventBusDomainEvent, EventHandler, EventSubscription } from './services/event-bus.service';
export { CacheService, CacheOptions as CacheServiceOptions, CacheStats, CacheEntry } from './services/cache.service';

// DTO exports
export * from './dto/base.dto';
export * from './dto/response.dto';
export * from './dto/ticket';
// Core pagination (keeping original)
export { PaginationDto as CorePaginationDto, PaginatedResponseDto as CorePaginatedResponseDto } from './dto/pagination.dto';

// Types exports
export * from './types/common.types';

// Utils exports
export * from './utils/array.utils';
export * from './utils/crypto.utils';
export * from './utils/date.utils';
export * from './utils/object.utils';
export * from './utils/string.utils';

// Adapters exports
export { CacheAdapter, CacheOptions as AdapterCacheOptions } from './adapters/cache.adapter';
export * from './adapters/database.adapter';

// Decorators exports
export * from './decorators/retry.decorator';
export * from './decorators/public.decorator';
export { Cache, CACHE_KEY, CACHE_TTL_KEY } from './decorators/cache.decorator';

// Filters exports
export * from './filters/global-exception.filter';

// Guards exports
export * from './guards/auth.guard';

// Interceptors exports
export * from './interceptors/logging.interceptor';

// Pipes exports
export * from './pipes/validation.pipe';

// Swagger exports
export * from './swagger';

// Interface exports
export * from './interfaces/cache.interface';

// Module exports
export * from './core.module';
export * from './ticket.module';