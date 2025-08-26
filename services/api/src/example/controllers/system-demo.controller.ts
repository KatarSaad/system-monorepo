import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiResponseDto } from '@katarsaad/core';
import { RateLimitGuard } from '@katarsaad/rate-limiting';
import { SystemDemoService } from '../services/system-demo.service';

@Controller('system-demo')
@ApiTags('System Demo')
@UseGuards(RateLimitGuard)
export class SystemDemoController {
  constructor(private readonly systemDemoService: SystemDemoService) {}

  @Get('all')
  @ApiOperation({ 
    summary: 'Demonstrate all system modules', 
    description: 'Comprehensive demonstration of all imported system modules and their capabilities' 
  })
  @ApiResponse({ status: 200, description: 'All modules demonstrated successfully' })
  async demonstrateAll() {
    const result = await this.systemDemoService.demonstrateAllModules();

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success(result.value, 'System modules demonstration completed');
  }

  @Get('core')
  @ApiOperation({ summary: 'Demo Core module', description: 'Demonstrate caching, utilities, and core services' })
  async demoCore() {
    const result = await (this.systemDemoService as any).demonstrateCore();
    return ApiResponseDto.success(result, 'Core module demonstrated');
  }

  @Get('security')
  @ApiOperation({ summary: 'Demo Security module', description: 'Demonstrate encryption, JWT, and password hashing' })
  async demoSecurity() {
    const result = await (this.systemDemoService as any).demonstrateSecurity();
    return ApiResponseDto.success(result, 'Security module demonstrated');
  }

  @Get('validation')
  @ApiOperation({ summary: 'Demo Validation module', description: 'Demonstrate data validation capabilities' })
  async demoValidation() {
    const result = await (this.systemDemoService as any).demonstrateValidation();
    return ApiResponseDto.success(result, 'Validation module demonstrated');
  }

  @Get('monitoring')
  @ApiOperation({ summary: 'Demo Monitoring module', description: 'Demonstrate metrics collection and monitoring' })
  async demoMonitoring() {
    const result = await (this.systemDemoService as any).demonstrateMonitoring();
    return ApiResponseDto.success(result, 'Monitoring module demonstrated');
  }

  @Get('audit')
  @ApiOperation({ summary: 'Demo Audit module', description: 'Demonstrate audit logging capabilities' })
  async demoAudit() {
    const result = await (this.systemDemoService as any).demonstrateAudit();
    return ApiResponseDto.success(result, 'Audit module demonstrated');
  }

  @Get('search')
  @ApiOperation({ summary: 'Demo Search module', description: 'Demonstrate search indexing and querying' })
  async demoSearch() {
    const result = await (this.systemDemoService as any).demonstrateSearch();
    return ApiResponseDto.success(result, 'Search module demonstrated');
  }

  @Get('rate-limiting')
  @ApiOperation({ summary: 'Demo Rate Limiting module', description: 'Demonstrate rate limiting functionality' })
  async demoRateLimiting() {
    const result = await (this.systemDemoService as any).demonstrateRateLimiting();
    return ApiResponseDto.success(result, 'Rate limiting module demonstrated');
  }

  @Get('file-storage')
  @ApiOperation({ summary: 'Demo File Storage module', description: 'Demonstrate file upload and storage' })
  async demoFileStorage() {
    const result = await (this.systemDemoService as any).demonstrateFileStorage();
    return ApiResponseDto.success(result, 'File storage module demonstrated');
  }

  @Get('queue')
  @ApiOperation({ summary: 'Demo Queue module', description: 'Demonstrate job queue functionality' })
  async demoQueue() {
    const result = await (this.systemDemoService as any).demonstrateQueue();
    return ApiResponseDto.success(result, 'Queue module demonstrated');
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Demo Notifications module', description: 'Demonstrate notification sending' })
  async demoNotifications() {
    const result = await (this.systemDemoService as any).demonstrateNotifications();
    return ApiResponseDto.success(result, 'Notifications module demonstrated');
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'Demo Feature Flags module', description: 'Demonstrate feature flag evaluation' })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID for feature flag evaluation' })
  async demoFeatureFlags(@Query('userId') userId = 'demo-user') {
    const result = await (this.systemDemoService as any).demonstrateFeatureFlags();
    return ApiResponseDto.success(result, 'Feature flags module demonstrated');
  }

  @Get('config')
  @ApiOperation({ summary: 'Demo Config module', description: 'Demonstrate configuration management' })
  async demoConfig() {
    const result = await (this.systemDemoService as any).demonstrateConfig();
    return ApiResponseDto.success(result, 'Config module demonstrated');
  }

  @Get('backup')
  @ApiOperation({ summary: 'Demo Backup module', description: 'Demonstrate backup creation and management' })
  async demoBackup() {
    const result = await (this.systemDemoService as any).demonstrateBackup();
    return ApiResponseDto.success(result, 'Backup module demonstrated');
  }

  @Get('logging')
  @ApiOperation({ summary: 'Demo Logging module', description: 'Demonstrate structured logging' })
  async demoLogging() {
    const result = await (this.systemDemoService as any).demonstrateLogging();
    return ApiResponseDto.success(result, 'Logging module demonstrated');
  }

  @Get('shared')
  @ApiOperation({ summary: 'Demo Shared module', description: 'Demonstrate shared utilities and helpers' })
  async demoShared() {
    const result = await (this.systemDemoService as any).demonstrateShared();
    return ApiResponseDto.success(result, 'Shared module demonstrated');
  }

  @Get('events')
  @ApiOperation({ summary: 'Demo Events module', description: 'Demonstrate event publishing and handling' })
  async demoEvents() {
    const result = await (this.systemDemoService as any).demonstrateEvents();
    return ApiResponseDto.success(result, 'Events module demonstrated');
  }

  @Post('stress-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Stress test all modules', 
    description: 'Run multiple iterations of all module demonstrations for performance testing' 
  })
  @ApiResponse({ status: 200, description: 'Stress test completed' })
  async stressTest(@Body() body: { iterations?: number }) {
    const iterations = body.iterations || 5;
    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const result = await this.systemDemoService.demonstrateAllModules();
      results.push({
        iteration: i + 1,
        success: result.isSuccess,
        duration: result.isSuccess ? result.value.duration : null,
        error: result.isFailure ? result.error : null,
      });
    }

    const totalDuration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    return ApiResponseDto.success({
      iterations,
      successCount,
      failureCount: iterations - successCount,
      totalDuration: `${totalDuration}ms`,
      averageDuration: `${Math.round(totalDuration / iterations)}ms`,
      results,
    }, 'Stress test completed');
  }
}