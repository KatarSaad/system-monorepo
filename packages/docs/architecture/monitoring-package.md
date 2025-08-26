# @system/monitoring Package Architecture

## Overview
Comprehensive monitoring, metrics collection, and observability services.

## Current Structure
```
src/
├── services/
│   └── metrics.service.ts
├── monitoring.module.ts
└── index.ts
```

## Architecture Principles

### 1. **Observable by Design**
- All operations are measurable
- Non-intrusive monitoring
- Performance impact minimal

### 2. **Extensible Metrics**
- Support multiple metric types (Counter, Gauge, Histogram)
- Pluggable exporters (Prometheus, StatsD, CloudWatch)
- Custom metric definitions

## Best Practices

### ✅ **Module Structure**
```typescript
@Global()
@Module({
  providers: [
    MetricsService,
    HealthCheckService,
    TracingService,
  ],
  exports: [
    MetricsService,
    HealthCheckService,
    TracingService,
  ],
})
export class MonitoringModule {}
```

### ✅ **Interface Design**
```typescript
export interface IMetricsService {
  createCounter(name: string, help: string, labels?: string[]): void;
  incrementCounter(name: string, value?: number, labels?: Record<string, string>): void;
  createGauge(name: string, help: string, labels?: string[]): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
  createHistogram(name: string, help: string, buckets?: number[], labels?: string[]): void;
  observeHistogram(name: string, value: number, labels?: Record<string, string>): void;
  getMetrics(): Promise<string>;
}

export interface MetricDefinition {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram';
  labels?: string[];
  buckets?: number[]; // For histograms
}
```

### ✅ **Service Implementation**
```typescript
@Injectable()
export class MetricsService implements IMetricsService {
  private counters = new Map<string, CounterMetric>();
  private gauges = new Map<string, GaugeMetric>();
  private histograms = new Map<string, HistogramMetric>();

  constructor(
    @Inject('MONITORING_OPTIONS') private options: MonitoringModuleOptions,
    private logger: Logger
  ) {
    this.initializeDefaultMetrics();
  }

  createCounter(name: string, help: string, labels: string[] = []): void {
    if (this.counters.has(name)) {
      this.logger.warn(`Counter ${name} already exists`);
      return;
    }

    this.counters.set(name, {
      name,
      help,
      labels,
      values: new Map(),
    });
  }

  incrementCounter(name: string, value = 1, labels: Record<string, string> = {}): void {
    const counter = this.counters.get(name);
    if (!counter) {
      this.logger.warn(`Counter ${name} not found, creating it`);
      this.createCounter(name, '');
      return this.incrementCounter(name, value, labels);
    }

    const labelKey = this.getLabelKey(labels);
    const currentValue = counter.values.get(labelKey) || 0;
    counter.values.set(labelKey, currentValue + value);
  }
}
```

## Transformation Guidelines

### 1. **Configuration Support**
```typescript
export interface MonitoringModuleOptions {
  metrics?: {
    enabled: boolean;
    prefix?: string;
    defaultLabels?: Record<string, string>;
    exportInterval?: number;
  };
  tracing?: {
    enabled: boolean;
    serviceName: string;
    endpoint?: string;
  };
  healthChecks?: {
    enabled: boolean;
    interval?: number;
    timeout?: number;
  };
  exporters?: ExporterConfig[];
}

export interface ExporterConfig {
  type: 'prometheus' | 'statsd' | 'cloudwatch' | 'custom';
  endpoint?: string;
  options?: any;
}

@Module({})
export class MonitoringModule {
  static forRoot(options?: MonitoringModuleOptions): DynamicModule {
    return {
      module: MonitoringModule,
      providers: [
        {
          provide: 'MONITORING_OPTIONS',
          useValue: { ...defaultOptions, ...options },
        },
        MetricsService,
        HealthCheckService,
        TracingService,
        ...this.createExporters(options?.exporters || []),
      ],
      exports: [MetricsService, HealthCheckService, TracingService],
    };
  }

  private static createExporters(configs: ExporterConfig[]): Provider[] {
    return configs.map(config => ({
      provide: `EXPORTER_${config.type.toUpperCase()}`,
      useFactory: () => this.createExporter(config),
    }));
  }
}
```

### 2. **Health Check Service**
```typescript
export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  timeout?: number;
  critical?: boolean;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: any;
  timestamp: Date;
  responseTime: number;
}

@Injectable()
export class HealthCheckService {
  private checks = new Map<string, HealthCheck>();

  registerCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      return {
        status: 'unhealthy',
        message: `Health check '${name}' not found`,
        timestamp: new Date(),
        responseTime: 0,
      };
    }

    const startTime = Date.now();
    try {
      const result = await Promise.race([
        check.check(),
        this.timeout(check.timeout || 5000),
      ]);

      return {
        ...result,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  async runAllChecks(): Promise<Record<string, HealthCheckResult>> {
    const results: Record<string, HealthCheckResult> = {};
    
    await Promise.all(
      Array.from(this.checks.keys()).map(async (name) => {
        results[name] = await this.runCheck(name);
      })
    );

    return results;
  }
}
```

### 3. **Tracing Service**
```typescript
export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  tags: Record<string, any>;
  logs: SpanLog[];
}

export interface SpanLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  fields?: Record<string, any>;
}

@Injectable()
export class TracingService {
  private activeSpans = new Map<string, Span>();

  startSpan(operationName: string, parentSpanId?: string): string {
    const span: Span = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      parentSpanId,
      operationName,
      startTime: new Date(),
      tags: {},
      logs: [],
    };

    this.activeSpans.set(span.spanId, span);
    return span.spanId;
  }

  finishSpan(spanId: string, tags?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = new Date();
    if (tags) {
      span.tags = { ...span.tags, ...tags };
    }

    this.exportSpan(span);
    this.activeSpans.delete(spanId);
  }

  addSpanLog(spanId: string, level: SpanLog['level'], message: string, fields?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.logs.push({
      timestamp: new Date(),
      level,
      message,
      fields,
    });
  }
}
```

### 4. **Decorator Pattern**
```typescript
export function Monitored(metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const finalMetricName = metricName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const metricsService = this.metricsService || 
        (global as any).__metricsService;

      if (!metricsService) {
        return originalMethod.apply(this, args);
      }

      const startTime = Date.now();
      const spanId = this.tracingService?.startSpan(finalMetricName);

      try {
        const result = await originalMethod.apply(this, args);
        
        metricsService.incrementCounter(`${finalMetricName}_success`);
        metricsService.observeHistogram(`${finalMetricName}_duration`, Date.now() - startTime);
        
        if (spanId) {
          this.tracingService?.finishSpan(spanId, { success: true });
        }

        return result;
      } catch (error) {
        metricsService.incrementCounter(`${finalMetricName}_error`);
        
        if (spanId) {
          this.tracingService?.addSpanLog(spanId, 'error', error.message);
          this.tracingService?.finishSpan(spanId, { success: false, error: error.message });
        }

        throw error;
      }
    };

    return descriptor;
  };
}

// Usage
@Injectable()
export class UserService {
  @Monitored('user.create')
  async createUser(userData: any): Promise<User> {
    // Implementation
  }
}
```

## Usage Examples

### ✅ **Correct Usage**
```typescript
@Module({
  imports: [
    MonitoringModule.forRoot({
      metrics: {
        enabled: true,
        prefix: 'myapp',
        exportInterval: 30000,
      },
      exporters: [
        { type: 'prometheus', endpoint: '/metrics' },
        { type: 'cloudwatch', options: { region: 'us-east-1' } },
      ],
    })
  ],
})
export class AppModule {}

// In service
constructor(
  private metricsService: MetricsService,
  private healthService: HealthCheckService
) {
  // Register custom metrics
  this.metricsService.createCounter('api_requests_total', 'Total API requests');
  
  // Register health checks
  this.healthService.registerCheck({
    name: 'database',
    check: () => this.checkDatabaseHealth(),
  });
}
```

## Testing Strategy

```typescript
describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [MonitoringModule.forRoot()],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should create and increment counters', () => {
    service.createCounter('test_counter', 'Test counter');
    service.incrementCounter('test_counter', 5);

    const metrics = service.getMetrics();
    expect(metrics).toContain('test_counter 5');
  });
});
```

## Performance Considerations

1. **Async Operations** - Non-blocking metric collection
2. **Batching** - Batch metric exports to reduce overhead
3. **Sampling** - Sample high-frequency metrics
4. **Memory Management** - Limit metric cardinality