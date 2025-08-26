import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ExampleModule } from './example/example.module';
import { SystemIntegrationModule } from './system/system.module';

// Import system modules
import {
  SystemModule,
  BaseService,
  Result,
  GlobalExceptionFilter,
  LoggingInterceptor,
  AuthGuard,
  DatabaseModule,
} from '@katarsaad/system-module';
import { EventBusService as SystemEventBus } from '@katarsaad/events';
import { ValidationService } from '@katarsaad/validation';
import { CoreModule } from '@katarsaad/core';
import { InfrastructureModule } from '@katarsaad/infrastructure';
import { SecurityModule } from '@katarsaad/security';
import { MonitoringModule } from '@katarsaad/monitoring';
import { ValidationModule } from '@katarsaad/validation';
import { AuditModule } from '@katarsaad/audit';
import { RateLimitingModule } from '@katarsaad/rate-limiting';
import { FileStorageModule } from '@katarsaad/file-storage';
import { SearchModule } from '@katarsaad/search';
import { FeatureFlagsModule } from '@katarsaad/feature-flags';
import { ConfigModule } from '@katarsaad/config';
import { BackupModule } from '@katarsaad/backup';
import { QueueModule } from '@katarsaad/queue';
import { NotificationsModule } from '@katarsaad/notifications';
import { EventsModule } from '@katarsaad/events';
import { LoggingModule } from '@katarsaad/logging';
import { SharedModule } from '@katarsaad/shared';
@Module({
  imports: [
    // Core system modules
    SystemModule,
    CoreModule,
    InfrastructureModule,
    DatabaseModule.forRoot(),

     SecurityModule,
    MonitoringModule,
     ValidationModule,
     AuditModule,
   RateLimitingModule,
    FileStorageModule,
     SearchModule,
    FeatureFlagsModule,
    ConfigModule,
    BackupModule,
    QueueModule,
     NotificationsModule,
    EventsModule,
    LoggingModule,
    SharedModule,

    // Application modules
    AuthModule,
    UsersModule,
    HealthModule,
    ExampleModule,
    SystemIntegrationModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
