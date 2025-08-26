import { Module, Global } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditQueryService } from './services/audit-query.service';
import { AuditMiddleware } from './middleware/audit.middleware';
import { MonitoringModule } from '@katarsaad/monitoring';
import { InfrastructureModule } from '@katarsaad/infrastructure';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule, InfrastructureModule, CoreModule],
  providers: [AuditService, AuditQueryService, AuditMiddleware],
  exports: [AuditService, AuditQueryService, AuditMiddleware],
})
export class AuditModule {}