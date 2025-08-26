import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({
    description: 'Service name',
    example: 'database'
  })
  service: string;

  @ApiProperty({
    description: 'Service status',
    example: 'healthy',
    enum: ['healthy', 'unhealthy', 'degraded']
  })
  status: 'healthy' | 'unhealthy' | 'degraded';

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 25
  })
  responseTime: number;

  @ApiProperty({
    description: 'Additional service details',
    example: { version: '1.0.0', uptime: 3600 }
  })
  details?: any;
}

export class HealthResponseDto {
  @ApiProperty({
    description: 'Overall system status',
    example: 'healthy',
    enum: ['healthy', 'unhealthy', 'degraded']
  })
  status: 'healthy' | 'unhealthy' | 'degraded';

  @ApiProperty({
    description: 'Health check timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: Date;

  @ApiProperty({
    description: 'System uptime in seconds',
    example: 3600
  })
  uptime: number;

  @ApiProperty({
    description: 'Individual service health checks',
    type: [HealthCheckDto]
  })
  checks: HealthCheckDto[];

  @ApiProperty({
    description: 'System information',
    example: {
      version: '1.0.0',
      environment: 'development',
      nodeVersion: '18.0.0'
    }
  })
  info: {
    version: string;
    environment: string;
    nodeVersion: string;
  };
}

export class MetricsDto {
  @ApiProperty({
    description: 'Metric name',
    example: 'http_requests_total'
  })
  name: string;

  @ApiProperty({
    description: 'Metric value',
    example: 1500
  })
  value: number;

  @ApiProperty({
    description: 'Metric labels',
    example: { method: 'GET', status: '200' }
  })
  labels?: Record<string, string>;

  @ApiProperty({
    description: 'Metric timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: Date;
}

export class MetricsResponseDto {
  @ApiProperty({
    description: 'Array of system metrics',
    type: [MetricsDto]
  })
  metrics: MetricsDto[];

  @ApiProperty({
    description: 'Metrics collection timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: Date;
}