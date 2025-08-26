import { Module, Global, DynamicModule } from '@nestjs/common';
import { MetricsService } from './services/metrics.service';
import { TracingService } from './services/tracing.service';
import { AlertingService } from './services/alerting.service';
import { IMetricsService } from './interfaces/metrics.interface';

export interface MonitoringModuleOptions {
  metrics?: {
    enabled?: boolean;
    prefix?: string;
    defaultLabels?: Record<string, string>;
    exportInterval?: number;
  };
}

@Global()
@Module({
  providers: [MetricsService, TracingService, AlertingService],
  exports: [MetricsService, TracingService, AlertingService],
})
export class MonitoringModule {
  static forRoot(options?: MonitoringModuleOptions): DynamicModule {
    return {
      module: MonitoringModule,
      providers: [
        {
          provide: 'MONITORING_OPTIONS',
          useValue: options || {},
        },
        {
          provide: 'IMetricsService',
          useClass: MetricsService,
        },
        MetricsService,
        TracingService,
        AlertingService,
      ],
      exports: ['IMetricsService', MetricsService, TracingService, AlertingService],
    };
  }
}