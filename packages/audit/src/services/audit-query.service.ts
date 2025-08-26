import { Injectable } from '@nestjs/common';
import { AuditLog, AuditQuery } from '../interfaces/audit.interface';
import { Infrastructure } from '@katarsaad/infrastructure';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class AuditQueryService {
  constructor(
    private infrastructure: Infrastructure,
    private metrics: MetricsService
  ) {}

  async search(filters: AuditQuery): Promise<{ data: AuditLog[]; total: number }> {
    try {
      const where: any = {};
      
      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.resource) where.resource = filters.resource;
      if (filters.resourceId) where.resourceId = filters.resourceId;
      
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }

      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const skip = (page - 1) * limit;

      // Mock implementation - replace with actual database query
      const mockData: AuditLog[] = [];
      const total = 0;

      this.metrics.incrementCounter('audit_queries', 1, { 
        resource: filters.resource || 'all',
        action: filters.action || 'all'
      });

      return { data: mockData, total };
    } catch (error) {
      this.metrics.incrementCounter('audit_query_failed', 1);
      throw error;
    }
  }

  async generateReport(filters: AuditQuery): Promise<any> {
    const { data } = await this.search(filters);
    
    const report = {
      totalEvents: data.length,
      byAction: this.groupBy(data, 'action'),
      byResource: this.groupBy(data, 'resource'),
      byUser: this.groupBy(data, 'userId'),
      timeRange: {
        start: filters.startDate,
        end: filters.endDate
      }
    };

    this.metrics.incrementCounter('audit_reports_generated', 1);
    return report;
  }

  private groupBy(array: AuditLog[], key: keyof AuditLog): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}