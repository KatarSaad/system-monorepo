# Monitoring Services Documentation

## MetricsService

Comprehensive metrics collection service for monitoring application performance and business metrics.

### Features
- **Counter Metrics** - Track incrementing values (requests, errors, etc.)
- **Gauge Metrics** - Track current values (memory usage, active connections)
- **Histogram Metrics** - Track distributions (response times, request sizes)
- **Labels Support** - Add dimensional data to metrics
- **Automatic Aggregation** - Built-in aggregation for histograms

### Metric Types

#### Counters
Counters are metrics that only increase over time (never decrease).

```typescript
import { MetricsService } from '@system/monitoring';

// Create and increment counter
metricsService.createCounter('http_requests_total', 'Total HTTP requests');
metricsService.incrementCounter('http_requests_total', 1, { method: 'GET', status: '200' });

// Increment with custom value
metricsService.incrementCounter('bytes_processed_total', 1024, { service: 'upload' });
```

#### Gauges
Gauges represent values that can go up and down.

```typescript
// Set gauge values
metricsService.setGauge('memory_usage_bytes', process.memoryUsage().heapUsed, 'Current memory usage');
metricsService.setGauge('active_connections', 42, 'Active database connections', { database: 'postgres' });
metricsService.setGauge('queue_size', 15, 'Current queue size', { queue: 'email' });
```

#### Histograms
Histograms track distributions of values across predefined buckets.

```typescript
// Observe histogram values (typically for timing)
metricsService.observeHistogram(
  'http_request_duration_seconds',
  0.245, // 245ms
  [0.1, 0.5, 1, 2.5, 5, 10], // buckets in seconds
  'HTTP request duration',
  { method: 'POST', endpoint: '/api/users' }
);

// Database query timing
const startTime = Date.now();
await database.query('SELECT * FROM users');
const duration = (Date.now() - startTime) / 1000;

metricsService.observeHistogram(
  'db_query_duration_seconds',
  duration,
  [0.01, 0.05, 0.1, 0.5, 1, 5],
  'Database query duration',
  { table: 'users', operation: 'select' }
);
```

### Usage Examples

#### HTTP Request Monitoring

```typescript
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {
    // Initialize metrics
    this.metricsService.createCounter('http_requests_total', 'Total HTTP requests');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        const response = context.switchToHttp().getResponse();
        
        // Increment request counter
        this.metricsService.incrementCounter('http_requests_total', 1, {
          method: request.method,
          status: response.statusCode.toString(),
          endpoint: request.route?.path || request.url
        });

        // Record request duration
        this.metricsService.observeHistogram(
          'http_request_duration_seconds',
          duration,
          [0.1, 0.5, 1, 2.5, 5, 10],
          'HTTP request duration',
          {
            method: request.method,
            status: response.statusCode.toString()
          }
        );
      })
    );
  }
}
```

#### Database Metrics

```typescript
@Injectable()
export class DatabaseMetricsService {
  constructor(private metricsService: MetricsService) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.metricsService.createCounter('db_queries_total', 'Total database queries');
    this.metricsService.createCounter('db_errors_total', 'Total database errors');
  }

  async executeQuery<T>(query: string, params: any[] = []): Promise<T> {
    const startTime = Date.now();
    const operation = this.getOperationType(query);

    try {
      const result = await this.database.query(query, params);
      
      // Success metrics
      this.metricsService.incrementCounter('db_queries_total', 1, {
        operation,
        status: 'success'
      });

      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.observeHistogram(
        'db_query_duration_seconds',
        duration,
        [0.01, 0.05, 0.1, 0.5, 1, 5],
        'Database query duration',
        { operation }
      );

      return result;
    } catch (error) {
      // Error metrics
      this.metricsService.incrementCounter('db_queries_total', 1, {
        operation,
        status: 'error'
      });
      
      this.metricsService.incrementCounter('db_errors_total', 1, {
        operation,
        error_type: error.constructor.name
      });

      throw error;
    }
  }

  private getOperationType(query: string): string {
    const normalized = query.trim().toLowerCase();
    if (normalized.startsWith('select')) return 'select';
    if (normalized.startsWith('insert')) return 'insert';
    if (normalized.startsWith('update')) return 'update';
    if (normalized.startsWith('delete')) return 'delete';
    return 'other';
  }
}
```

#### Business Metrics

```typescript
@Injectable()
export class BusinessMetricsService {
  constructor(private metricsService: MetricsService) {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.metricsService.createCounter('users_registered_total', 'Total users registered');
    this.metricsService.createCounter('orders_created_total', 'Total orders created');
    this.metricsService.createCounter('revenue_total', 'Total revenue');
  }

  trackUserRegistration(userType: string) {
    this.metricsService.incrementCounter('users_registered_total', 1, {
      user_type: userType
    });
  }

  trackOrderCreation(orderValue: number, currency: string) {
    this.metricsService.incrementCounter('orders_created_total', 1, {
      currency
    });
    
    this.metricsService.incrementCounter('revenue_total', orderValue, {
      currency
    });

    this.metricsService.observeHistogram(
      'order_value_distribution',
      orderValue,
      [10, 50, 100, 500, 1000, 5000],
      'Order value distribution',
      { currency }
    );
  }

  updateActiveUsers(count: number) {
    this.metricsService.setGauge('active_users', count, 'Currently active users');
  }
}
```

### API Reference

#### Counter Methods
- `createCounter(name: string, help: string, labels?: Record<string, string>): void`
- `incrementCounter(name: string, value?: number, labels?: Record<string, string>): void`

#### Gauge Methods
- `setGauge(name: string, value: number, help?: string, labels?: Record<string, string>): void`

#### Histogram Methods
- `observeHistogram(name: string, value: number, buckets?: number[], help?: string, labels?: Record<string, string>): void`

#### Utility Methods
- `getMetrics(): { counters: CounterMetric[]; gauges: GaugeMetric[]; histograms: HistogramMetric[] }`
- `reset(): void`

### Metrics Export

```typescript
@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  getMetrics() {
    const metrics = this.metricsService.getMetrics();
    
    // Convert to Prometheus format or return as JSON
    return this.formatMetrics(metrics);
  }

  private formatMetrics(metrics: any) {
    // Format for Prometheus, JSON, or other monitoring systems
    return {
      timestamp: new Date().toISOString(),
      counters: metrics.counters,
      gauges: metrics.gauges,
      histograms: metrics.histograms
    };
  }
}
```

### Best Practices

1. **Metric Naming** - Use descriptive names with units (e.g., `http_request_duration_seconds`)
2. **Label Cardinality** - Keep label combinations reasonable to avoid memory issues
3. **Histogram Buckets** - Choose buckets that make sense for your use case
4. **Regular Collection** - Set up regular metric collection and export
5. **Monitoring** - Monitor the monitoring system itself
6. **Documentation** - Document what each metric measures and when it's updated

### Integration with Monitoring Systems

#### Prometheus Integration

```typescript
@Injectable()
export class PrometheusExporter {
  constructor(private metricsService: MetricsService) {}

  exportMetrics(): string {
    const metrics = this.metricsService.getMetrics();
    let output = '';

    // Export counters
    metrics.counters.forEach(counter => {
      output += `# HELP ${counter.name} ${counter.help}\n`;
      output += `# TYPE ${counter.name} counter\n`;
      const labels = this.formatLabels(counter.labels);
      output += `${counter.name}${labels} ${counter.value}\n`;
    });

    // Export gauges
    metrics.gauges.forEach(gauge => {
      output += `# HELP ${gauge.name} ${gauge.help}\n`;
      output += `# TYPE ${gauge.name} gauge\n`;
      const labels = this.formatLabels(gauge.labels);
      output += `${gauge.name}${labels} ${gauge.value}\n`;
    });

    return output;
  }

  private formatLabels(labels: Record<string, string>): string {
    const labelPairs = Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
    return labelPairs ? `{${labelPairs}}` : '';
  }
}
```