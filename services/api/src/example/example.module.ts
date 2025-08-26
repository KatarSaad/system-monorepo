import { Module } from '@nestjs/common';
import { CoreModule } from '@katarsaad/core';
import { SecurityModule } from '@katarsaad/security';
import { ValidationModule } from '@katarsaad/validation';
import { AuditModule } from '@katarsaad/audit';
import { SearchModule } from '@katarsaad/search';
import { RateLimitingModule } from '@katarsaad/rate-limiting';
import { MonitoringModule } from '@katarsaad/monitoring';
import { InfrastructureModule } from '@katarsaad/infrastructure';
import { FileStorageModule } from '@katarsaad/file-storage';
import { QueueModule } from '@katarsaad/queue';
import { NotificationsModule } from '@katarsaad/notifications';
import { EventsModule } from '@katarsaad/events';
import { FeatureFlagsModule } from '@katarsaad/feature-flags';
import { ConfigModule } from '@katarsaad/config';
import { BackupModule } from '@katarsaad/backup';
import { LoggingModule } from '@katarsaad/logging';
import { SharedModule } from '@katarsaad/shared';

import { ExampleController } from './controllers/example.controller';
import { ExampleService } from './services/example.service';
import { SystemDemoController } from './controllers/system-demo.controller';
import { SystemDemoService } from './services/system-demo.service';
import { FileUploadController } from './controllers/file-upload.controller';
import { FileUploadService } from './services/file-upload.service';

@Module({
  imports: [
    // Core system modules with configuration
    CoreModule.forRoot({
      cache: {
        ttl: 3600,
        maxSize: 1000,
        cleanupInterval: 60000,
      },
    }),
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
    ValidationModule.forRoot({
      defaultLocale: 'en',
      customValidators: new Map([
        ['strongPassword', (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)],
        ['phoneNumber', (value) => /^\+?[\d\s\-\(\)]+$/.test(value)],
        ['minLength', (value, params) => value.length >= (params?.min || 2)],
      ]),
      errorMessages: new Map([
        ['strongPassword', 'Password must contain uppercase, lowercase, and number'],
        ['phoneNumber', 'Invalid phone number format'],
        ['minLength', 'Value is too short'],
      ]),
    }),
    MonitoringModule.forRoot({
      metrics: {
        enabled: true,
        prefix: 'example_api',
        defaultLabels: { service: 'example' },
        exportInterval: 30000,
      },
    }),
    InfrastructureModule.forRoot(),
    
    // Feature modules
    AuditModule,
    SearchModule,
    RateLimitingModule,
    FileStorageModule,
    QueueModule,
    NotificationsModule,
    EventsModule,
    FeatureFlagsModule,
    ConfigModule,
    BackupModule,
    LoggingModule,
    SharedModule,
  ],
  controllers: [
    ExampleController,
    SystemDemoController,
    FileUploadController,
  ],
  providers: [
    ExampleService,
    SystemDemoService,
    FileUploadService,
  ],
  exports: [
    ExampleService,
    SystemDemoService,
    FileUploadService,
  ],
})
export class ExampleModule {}