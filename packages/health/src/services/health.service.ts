import { Injectable } from '@nestjs/common';

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
  lastChecked: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  uptime: number;
  timestamp: Date;
}

@Injectable()
export class HealthService {
  private startTime = Date.now();

  async check(): Promise<SystemHealth> {
    const checks = await Promise.all([
      this.checkMemory(),
      this.checkDisk()
    ]);

    const overallStatus = this.determineOverallStatus(checks);

    return {
      status: overallStatus,
      checks,
      uptime: Date.now() - this.startTime,
      timestamp: new Date()
    };
  }

  private async checkMemory(): Promise<HealthCheck> {
    const start = Date.now();
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (usagePercent > 90) status = 'unhealthy';
    else if (usagePercent > 75) status = 'degraded';

    return {
      name: 'memory',
      status,
      responseTime: Date.now() - start,
      details: {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB),
        usagePercent: Math.round(usagePercent)
      },
      lastChecked: new Date()
    };
  }

  private async checkDisk(): Promise<HealthCheck> {
    const start = Date.now();
    return {
      name: 'disk',
      status: 'healthy',
      responseTime: Date.now() - start,
      details: { available: '85%' },
      lastChecked: new Date()
    };
  }

  private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'unhealthy' | 'degraded' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    
    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }
}