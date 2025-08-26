import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from '@katarsaad/health';
import { MetricsService } from '@katarsaad/monitoring';
import { ApiResponseDto } from '@katarsaad/core';
import { Public } from '../auth/decorators/public.decorator';
import { HealthResponseDto } from './dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private healthService: HealthService,
    private metricsService: MetricsService,
  ) {}

  @Public()
  @Get()
  async check(): Promise<ApiResponseDto<any>> {
    const health = await this.healthService.check();
    return ApiResponseDto.success(health, 'Health check completed');
  }

  @Public()
  @Get('detailed')
  async detailedCheck(): Promise<ApiResponseDto<any>> {
    const health = await this.healthService.check();
    return ApiResponseDto.success(health, 'Detailed health check completed');
  }

  @Public()
  @Get('metrics')
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics(): Promise<any> {
    // Add some sample metrics if none exist
    this.metricsService.incrementCounter('health_checks', 1);
    this.metricsService.setGauge('system_uptime', Date.now());
    return this.metricsService.getMetrics();
  }
}
