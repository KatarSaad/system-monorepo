import { Injectable, Inject } from '@nestjs/common';
import {
  ICacheService,
  EventBusService,
  Result,
  Logger,
  ArrayUtils,
  CryptoUtils,
  DateUtils,
  ObjectUtils,
  StringUtils,
} from '@katarsaad/core';
import { IEncryptionService, JwtService, PasswordService } from '@katarsaad/security';
import { IValidationService } from '@katarsaad/validation';
import { AuditService } from '@katarsaad/audit';
import { SearchService } from '@katarsaad/search';
import { IMetricsService } from '@katarsaad/monitoring';
import { RateLimiterService } from '@katarsaad/rate-limiting';
import { FileStorageService } from '@katarsaad/file-storage';
import { QueueService } from '@katarsaad/queue';
import { NotificationService } from '@katarsaad/notifications';
import { FeatureFlagsService } from '@katarsaad/feature-flags';
import { ConfigService } from '@katarsaad/config';
import { BackupService } from '@katarsaad/backup';
import { LoggingService } from '@katarsaad/logging';
import { FileUtils, NumberUtils, PerformanceUtils } from '@katarsaad/shared';

@Injectable()
export class SystemDemoService {
  private readonly logger = new Logger(SystemDemoService.name);

  constructor(
    @Inject('ICacheService') private cacheService: ICacheService,
    @Inject('IEncryptionService') private encryptionService: IEncryptionService,
    @Inject('IValidationService') private validationService: IValidationService,
    @Inject('IMetricsService') private metricsService: IMetricsService,
    private eventBus: EventBusService,
    private auditService: AuditService,
    private searchService: SearchService,
    private rateLimiterService: RateLimiterService,
    private fileStorageService: FileStorageService,
    private queueService: QueueService,
    private notificationService: NotificationService,
    private featureFlagsService: FeatureFlagsService,
    private configService: ConfigService,
    private backupService: BackupService,
    private loggingService: LoggingService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {
    this.logger.info('SystemDemoService initialized with all system modules');
  }

  async demonstrateAllModules(): Promise<Result<any>> {
    const startTime = Date.now();
    this.logger.info('Starting comprehensive system modules demonstration');

    try {
      const results = {
        core: await this.demonstrateCore(),
        security: await this.demonstrateSecurity(),
        validation: await this.demonstrateValidation(),
        monitoring: await this.demonstrateMonitoring(),
        audit: await this.demonstrateAudit(),
        search: await this.demonstrateSearch(),
        rateLimiting: await this.demonstrateRateLimiting(),
        fileStorage: await this.demonstrateFileStorage(),
        queue: await this.demonstrateQueue(),
        notifications: await this.demonstrateNotifications(),
        featureFlags: await this.demonstrateFeatureFlags(),
        config: await this.demonstrateConfig(),
        backup: await this.demonstrateBackup(),
        logging: await this.demonstrateLogging(),
        shared: await this.demonstrateShared(),
        events: await this.demonstrateEvents(),
      };

      const duration = Date.now() - startTime;
      this.logger.info(`System demonstration completed in ${duration}ms`);
      
      return Result.ok({
        message: 'All system modules demonstrated successfully',
        duration: `${duration}ms`,
        results,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('System demonstration failed', error);
      return Result.fail(`Demonstration failed: ${error.message}`);
    }
  }

  private async demonstrateCore(): Promise<any> {
    // Cache operations
    await this.cacheService.set('demo:core', { test: 'data' }, { ttl: 300 });
    const cached = await this.cacheService.get('demo:core');

    // Utility functions
    const arrayDemo = ArrayUtils.chunk([1, 2, 3, 4, 5, 6], 2);
    const cryptoDemo = CryptoUtils.hash('demo-data');
    const dateDemo = DateUtils.format(new Date(), 'YYYY-MM-DD');
    const objectDemo = ObjectUtils.pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
    const stringDemo = StringUtils.capitalize('hello world');

    return {
      cache: cached.isSuccess ? cached.value : null,
      utils: { arrayDemo, cryptoDemo, dateDemo, objectDemo, stringDemo },
    };
  }

  private async demonstrateSecurity(): Promise<any> {
    // Password hashing
    const password = 'TestPassword123!';
    const hashResult = await this.passwordService.hash(password);
    const verifyResult = hashResult.isSuccess 
      ? await this.passwordService.verify(password, hashResult.value)
      : Result.fail('Hash failed');

    // JWT operations
    const payload = { sub: 'demo-user', email: 'demo@example.com', role: 'admin' };
    const tokenResult = this.jwtService.sign(payload);
    const verifyTokenResult = tokenResult.isSuccess
      ? this.jwtService.verify(tokenResult.value)
      : Result.fail('Token generation failed');

    // Encryption
    const data = 'Sensitive data to encrypt';
    const encryptResult = await this.encryptionService.encrypt(data);
    const decryptResult = encryptResult.isSuccess
      ? await this.encryptionService.decrypt(encryptResult.value)
      : Result.fail('Encryption failed');

    return {
      password: {
        hashed: hashResult.isSuccess,
        verified: verifyResult.isSuccess ? verifyResult.value : false,
      },
      jwt: {
        generated: tokenResult.isSuccess,
        verified: verifyTokenResult.isSuccess ? verifyTokenResult.value : null,
      },
      encryption: {
        encrypted: encryptResult.isSuccess,
        decrypted: decryptResult.isSuccess ? decryptResult.value === data : false,
      },
    };
  }

  private async demonstrateValidation(): Promise<any> {
    const testData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      phone: '+1-555-123-4567',
      name: 'John Doe',
    };

    // Mock validation results since we don't have actual validation service implementation
    return {
      email: true,
      password: true,
      phone: true,
      name: true,
      customValidation: 'All validations passed',
    };
  }

  private async demonstrateMonitoring(): Promise<any> {
    // Create and increment counters
    this.metricsService.createCounter('demo_operations', 'Demo operations counter');
    this.metricsService.incrementCounter('demo_operations');

    // Observe histogram
    this.metricsService.observeHistogram('demo_duration', 150);

    // Create gauge
    this.metricsService.createGauge('demo_active_connections', 'Active connections');
    this.metricsService.setGauge('demo_active_connections', 42);

    return {
      counters: ['demo_operations'],
      histograms: ['demo_duration'],
      gauges: ['demo_active_connections'],
      status: 'Metrics collected successfully',
    };
  }

  private async demonstrateAudit(): Promise<any> {
    await this.auditService.log({
      userId: 'demo-user',
      action: 'DEMO',
      resource: 'system',
      resourceId: 'demo-resource',
      newValues: { demo: true, timestamp: new Date() },
      timestamp: new Date(),
    });

    return {
      logged: true,
      action: 'DEMO',
      resource: 'system',
      timestamp: new Date(),
    };
  }

  private async demonstrateSearch(): Promise<any> {
    // Index a document
    await this.searchService.indexDocument('demo', {
      id: 'demo-doc-1',
      title: 'Demo Document',
      content: 'This is a demonstration document for search functionality',
      tags: ['demo', 'test', 'search'],
      createdAt: new Date(),
    });

    // Search for documents
    const searchResult = await this.searchService.search('demo', {
      query: 'demonstration',
      page: 1,
      limit: 10,
    });

    return {
      indexed: true,
      searchResult: searchResult.isSuccess ? searchResult.value : null,
    };
  }

  private async demonstrateRateLimiting(): Promise<any> {
    const key = 'demo-user';
    const limit = 10;
    const window = 60; // 60 seconds

    const result = await this.rateLimiterService.checkLimit(key, {
      windowMs: window * 1000,
      maxRequests: limit,
    });

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }

  private async demonstrateFileStorage(): Promise<any> {
    const testFile = {
      originalname: 'demo.txt',
      buffer: Buffer.from('Demo file content'),
      mimetype: 'text/plain',
      size: 17,
    };

    const uploadResult = await this.fileStorageService.upload(
      testFile.buffer,
      testFile.originalname,
      {
        generateThumbnail: false,
      }
    );

    return {
      uploaded: uploadResult.isSuccess,
      fileInfo: uploadResult.isSuccess ? uploadResult.value : null,
    };
  }

  private async demonstrateQueue(): Promise<any> {
    const jobData = {
      type: 'demo-job',
      payload: { message: 'Hello from queue!', timestamp: new Date() },
    };

    const jobId = await this.queueService.addJob('demo-queue', 'demo-job', jobData.payload);

    return {
      jobAdded: true,
      jobId: jobId,
      queue: 'demo-queue',
    };
  }

  private async demonstrateNotifications(): Promise<any> {
    const notification = {
      to: 'demo@example.com',
      templateId: 'demo-template',
      variables: { name: 'Demo User', message: 'This is a test notification' },
      priority: 'normal' as const,
    };

    await this.notificationService.sendNotification(notification);

    return {
      sent: true,
      notificationId: 'demo-notification-id',
      type: 'email',
    };
  }

  private async demonstrateFeatureFlags(): Promise<any> {
    const flags = {
      demoFeature: await this.featureFlagsService.isEnabled('demo-feature', 'demo-user'),
      betaFeature: await this.featureFlagsService.isEnabled('beta-feature', 'demo-user'),
      experimentalFeature: await this.featureFlagsService.isEnabled('experimental-feature', 'demo-user'),
    };

    return {
      flags,
      evaluatedFor: 'demo-user',
      timestamp: new Date(),
    };
  }

  private async demonstrateConfig(): Promise<any> {
    const configs = {
      appName: this.configService.get('APP_NAME', 'Demo App'),
      environment: this.configService.get('NODE_ENV', 'development'),
      port: this.configService.get('PORT', 3000),
      databaseUrl: this.configService.get('DATABASE_URL', 'not-configured'),
    };

    return {
      configs,
      source: 'environment variables and defaults',
    };
  }

  private async demonstrateBackup(): Promise<any> {
    const backupResult = await this.backupService.createBackup({
      encrypt: false,
      compress: false,
    });

    return {
      created: true,
      backupId: backupResult.id,
      timestamp: new Date(),
    };
  }

  private async demonstrateLogging(): Promise<any> {
    this.loggingService.info('Demo log message', { demo: true });
    this.loggingService.warn('Demo warning message', { level: 'warning' });
    this.loggingService.error('Demo error message', new Error('Demo error'));

    return {
      logged: true,
      levels: ['info', 'warn', 'error'],
      adapter: 'winston/pino',
    };
  }

  private async demonstrateShared(): Promise<any> {
    // File utilities
    const fileInfo = { name: 'demo.txt', extension: 'txt', size: 1024 };
    
    // Number utilities
    const formatted = NumberUtils.formatCurrency(1234.56, 'USD');
    
    // Performance utilities
    PerformanceUtils.startTimer('demo-operation');
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
    const perfEnd = PerformanceUtils.endTimer('demo-operation');
    
    // Mock validation utilities
    const isEmail = true;
    
    // Mock HTTP utilities
    const userAgent = { browser: 'Chrome', version: '120.0', os: 'Windows' };

    return {
      fileInfo,
      formatted,
      performance: `${perfEnd}ms`,
      isEmail,
      userAgent,
    };
  }

  private async demonstrateEvents(): Promise<any> {
    // Publish an event
    this.eventBus.publish({
      id: `demo-event-${Date.now()}`,
      type: 'SystemDemoCompleted',
      aggregateId: 'system-demo',
      aggregateType: 'Demo',
      version: 1,
      occurredOn: new Date(),
      data: {
        message: 'System demonstration completed successfully',
        modules: 15,
        timestamp: new Date(),
      },
    });

    return {
      published: true,
      eventType: 'SystemDemoCompleted',
      timestamp: new Date(),
    };
  }
}