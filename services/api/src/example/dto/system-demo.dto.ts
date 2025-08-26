import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class StressTestDto {
  @ApiPropertyOptional({ 
    description: 'Number of iterations to run', 
    example: 5, 
    minimum: 1, 
    maximum: 50,
    default: 5 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  iterations?: number;
}

export class ModuleDemoResponseDto {
  @ApiProperty({ description: 'Demo execution status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Demo execution duration', example: '150ms' })
  duration: string;

  @ApiProperty({ description: 'Module name', example: 'core' })
  module: string;

  @ApiProperty({ description: 'Demo results' })
  results: any;

  @ApiProperty({ description: 'Timestamp', example: '2024-01-15T10:30:00.000Z' })
  timestamp: Date;
}

export class SystemHealthDto {
  @ApiProperty({ description: 'Overall system status', example: 'healthy' })
  status: string;

  @ApiProperty({ description: 'Module statuses' })
  modules: {
    core: string;
    security: string;
    validation: string;
    monitoring: string;
    audit: string;
    search: string;
    rateLimiting: string;
    fileStorage: string;
    queue: string;
    notifications: string;
    featureFlags: string;
    config: string;
    backup: string;
    logging: string;
    shared: string;
    events: string;
  };

  @ApiProperty({ description: 'Performance metrics' })
  metrics: {
    uptime: string;
    memoryUsage: string;
    cpuUsage: string;
    activeConnections: number;
  };

  @ApiProperty({ description: 'Last check timestamp' })
  lastCheck: Date;
}

export class PerformanceTestDto {
  @ApiPropertyOptional({ 
    description: 'Test duration in seconds', 
    example: 30, 
    minimum: 10, 
    maximum: 300 
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(300)
  duration?: number;

  @ApiPropertyOptional({ 
    description: 'Concurrent requests', 
    example: 10, 
    minimum: 1, 
    maximum: 100 
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  concurrency?: number;

  @ApiPropertyOptional({ 
    description: 'Include heavy operations', 
    example: false 
  })
  @IsOptional()
  @IsBoolean()
  includeHeavyOps?: boolean;
}

export class FeatureFlagTestDto {
  @ApiProperty({ description: 'User ID for flag evaluation', example: 'user-123' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Feature flags to test', example: ['beta-feature', 'new-ui'] })
  @IsOptional()
  flags?: string[];
}

export class ConfigTestDto {
  @ApiPropertyOptional({ description: 'Environment to test', example: 'development' })
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiPropertyOptional({ description: 'Include sensitive configs', example: false })
  @IsOptional()
  @IsBoolean()
  includeSensitive?: boolean;
}