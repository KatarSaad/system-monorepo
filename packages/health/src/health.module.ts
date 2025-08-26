import { Module, Global } from '@nestjs/common';
import { HealthService } from './services/health.service';
import { DependencyHealthService } from './services/dependency-health.service';
import { MonitoringModule } from '@katarsaad/monitoring';
import { InfrastructureModule } from '@katarsaad/infrastructure';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), InfrastructureModule],
  providers: [HealthService, DependencyHealthService],
  exports: [HealthService, DependencyHealthService],
})
export class HealthModule {}