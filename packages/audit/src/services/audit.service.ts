import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventBusService, CacheService } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';

export interface AuditLog {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Optional() private eventBus: EventBusService,
    @Optional() private cacheService: CacheService,
    @Optional() private readonly metricsService: MetricsService
  ) {
    this.initializeMetrics();
  }

  async log(auditData: AuditLog): Promise<void> {
    try {
      // Mock database operation for now
      const log = { isSuccess: true, value: { id: this.generateId() } };

      if (log.isSuccess) {
        if (this.eventBus && typeof this.eventBus.publish === 'function') {
          this.eventBus.publish({
            id: this.generateId(),
            type: 'AuditLogCreated',
            aggregateId: (log.value as any).id,
            aggregateType: 'AuditLog',
            version: 1,
            occurredOn: new Date(),
            data: auditData
          });
        }

        this.metricsService?.incrementCounter('audit_logs_created', 1, {
          action: auditData.action,
          resource: auditData.resource
        });
      }
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
      this.metricsService?.incrementCounter('audit_logs_failed', 1);
    }
  }

  async query(query: AuditQuery) {
    const { page = 1, limit = 50, ...filters } = query;
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    // Mock query for now
    const result = { isSuccess: true, value: [] };
    this.metricsService?.incrementCounter('audit_queries', 1);
    return result;
  }

  async getComplianceReport(startDate: Date, endDate: Date) {
    const cacheKey = `compliance:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached.isSuccess && cached.value) {
      return cached.value;
    }

    // Mock stats for now
    const stats = { isSuccess: true, value: { _count: { id: 0 } } };

    const report = {
      period: { start: startDate, end: endDate },
      totalActions: stats.isSuccess ? (stats.value as any)._count.id : 0,
      actionBreakdown: stats.isSuccess ? stats.value : [],
      generatedAt: new Date()
    };

    await this.cacheService.set(cacheKey, report, { ttl: 3600 });
    return report;
  }

  private initializeMetrics() {
    try {
      if (this.metricsService) {
        this.metricsService.createCounter('audit_logs_created', 'Audit logs created');
        this.metricsService.createCounter('audit_logs_failed', 'Failed audit log creations');
        this.metricsService.createCounter('audit_queries', 'Audit log queries');
      }
    } catch (error) {
      this.logger.warn('Metrics service not available, continuing without metrics');
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}