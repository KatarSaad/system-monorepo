import { Module, Global } from '@nestjs/common';
import { CoreModule } from '@katarsaad/core';
import { InfrastructureModule } from '@katarsaad/infrastructure';
import { MonitoringModule } from '@katarsaad/monitoring';
import { AuditModule } from '@katarsaad/audit';
import { RateLimitingModule } from '@katarsaad/rate-limiting';
import { HealthModule } from '@katarsaad/health';
import { BackupModule } from '@katarsaad/backup';
import { FeatureFlagsModule } from '@katarsaad/feature-flags';
import { QueueModule } from '@katarsaad/queue';
import { SharedModule } from '@katarsaad/shared';
import { TestingModule } from '@katarsaad/testing';

@Global()
@Module({
  imports: [
    // Core modules first
    CoreModule,
    InfrastructureModule,
    MonitoringModule,
    
    // Feature modules that depend on core modules
    AuditModule,
    RateLimitingModule,
    HealthModule,
    BackupModule,
    FeatureFlagsModule,
    QueueModule,
    SharedModule,
    TestingModule,
  ],
  exports: [
    CoreModule,
    InfrastructureModule,
    MonitoringModule,
    AuditModule,
    RateLimitingModule,
    HealthModule,
    BackupModule,
    FeatureFlagsModule,
    QueueModule,
    SharedModule,
    TestingModule,
  ],
})
export class SystemModule {}