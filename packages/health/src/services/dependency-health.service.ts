import { Injectable } from '@nestjs/common';
import { HealthCheck, HealthStatus, HealthIndicator } from '../interfaces/health.interface';
import { MetricsService } from '@katarsaad/monitoring';
import { Infrastructure } from '@katarsaad/infrastructure';

@Injectable()
export class DependencyHealthService implements HealthIndicator {
  name = 'dependencies';

  constructor(
    private metrics: MetricsService,
    private infrastructure: Infrastructure
  ) {}

  async check(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const checks = await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkExternalAPIs()
      ]);

      const allUp = checks.every(check => check.status === HealthStatus.UP);
      const status = allUp ? HealthStatus.UP : HealthStatus.DEGRADED;

      this.metrics.incrementCounter('health_check_completed', 1, { 
        status: status.toString() 
      });

      return {
        name: this.name,
        status,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        metadata: { checks }
      };
    } catch (error) {
      this.metrics.incrementCounter('health_check_failed', 1);
      
      return {
        name: this.name,
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Health check failed',
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  private async checkDatabase(): Promise<{ name: string; status: HealthStatus }> {
    try {
      // Mock database check
      await new Promise(resolve => setTimeout(resolve, 10));
      return { name: 'database', status: HealthStatus.UP };
    } catch {
      return { name: 'database', status: HealthStatus.DOWN };
    }
  }

  private async checkRedis(): Promise<{ name: string; status: HealthStatus }> {
    try {
      // Mock Redis check
      await new Promise(resolve => setTimeout(resolve, 5));
      return { name: 'redis', status: HealthStatus.UP };
    } catch {
      return { name: 'redis', status: HealthStatus.DOWN };
    }
  }

  private async checkExternalAPIs(): Promise<{ name: string; status: HealthStatus }> {
    try {
      // Mock external API check
      await new Promise(resolve => setTimeout(resolve, 20));
      return { name: 'external_apis', status: HealthStatus.UP };
    } catch {
      return { name: 'external_apis', status: HealthStatus.DOWN };
    }
  }
}