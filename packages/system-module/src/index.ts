// Main system module
export * from './system.module';

// Re-export all available packages
export {
  // Core exports
  BaseService, Result, Logger, Guard, Mapper,
  Entity, AggregateRoot, ValueObject, Repository,
  BaseDto, PaginationDto, ApiResponseDto,
  StringUtils, ObjectUtils, ArrayUtils, CryptoUtils, DateUtils,
  Retry, Public, Cache,
  GlobalExceptionFilter, AuthGuard, LoggingInterceptor, CustomValidationPipe
} from '@katarsaad/core';

export {
  Infrastructure, PrismaService,
  DatabaseModule, InfrastructureModule
} from '@katarsaad/infrastructure';

export { MetricsService, MonitoringModule } from '@katarsaad/monitoring';
export { EncryptionService, SecurityModule } from '@katarsaad/security';
export { ValidationService, AdvancedValidationService, ValidationModule } from '@katarsaad/validation';
export { EventBusService, EventBusService as SystemEventBus, MessageQueueService, EventStoreService, EventsModule } from '@katarsaad/events';

// Additional utility packages
export { AuditService, Auditable, AuditModule } from '@katarsaad/audit';
export { BackupService, BackupModule } from '@katarsaad/backup';
export { ConfigService, ConfigModule } from '@katarsaad/config';
export { FeatureFlagsService, FeatureFlagsModule } from '@katarsaad/feature-flags';
export { FileStorageService, FileStorageModule } from '@katarsaad/file-storage';
export { HealthService, HealthModule } from '@katarsaad/health';
export { NotificationService, NotificationTemplateService, NotificationsModule } from '@katarsaad/notifications';
export { QueueService, QueueModule } from '@katarsaad/queue';
export { RateLimiterService, RateLimitGuard, RateLimitingModule } from '@katarsaad/rate-limiting';
export { SearchService, IndexingService, SearchModule } from '@katarsaad/search';
export { FileUtils, NumberUtils, PerformanceUtils, SharedModule } from '@katarsaad/shared';
export { TestFactory, IntegrationTestBase, TestingModule } from '@katarsaad/testing';
export { LoggingService, WinstonAdapter, PinoAdapter, LoggingModule } from '@katarsaad/logging';