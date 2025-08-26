import { Injectable } from '@nestjs/common';
import { BaseService, Result, Logger } from '@katarsaad/system-module';
import { AuditService } from '@katarsaad/audit';
import { NotificationService } from '@katarsaad/notifications';
import { HealthService } from '@katarsaad/health';
import { MetricsService } from '@katarsaad/monitoring';
import { SearchService } from '@katarsaad/search';

@Injectable()
export class SystemIntegrationService extends BaseService {
  constructor(
    private auditService: AuditService,
    private notificationService: NotificationService,
    private healthService: HealthService,
    private metricsService: MetricsService,
    private searchService: SearchService,
  ) {
    super('SystemIntegrationService');
    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.logger.info('System integration initialized');

    // Initialize metrics
    this.metricsService.createCounter(
      'system_events_processed',
      'System events processed',
    );
    this.metricsService.createCounter(
      'validation_requests',
      'Validation requests',
    );
    this.metricsService.createCounter('audit_events', 'Audit events created');
    this.metricsService.createCounter(
      'notifications_sent',
      'Notifications sent',
    );
  }

  async validateAndProcess<T>(data: T): Promise<Result<T>> {
    // Simple validation - can be enhanced later
    return Result.ok(data);
  }

  async publishEvent(eventType: string, data: any): Promise<void> {
    this.logger.info(`Event published: ${eventType}`, data);

    // Create audit log
    await this.auditService.log({
      action: eventType,
      resource: 'Event',
      resourceId: data.id || 'unknown',
      userId: data.userId || 'system',
      timestamp: new Date(),
      metadata: data,
    });

    // Update metrics
    this.metricsService.incrementCounter('system_events_processed', 1);
    this.metricsService.incrementCounter('audit_events', 1);
  }

  async sendNotification(
    type: string,
    recipient: string,
    message: string,
  ): Promise<void> {
    await this.notificationService.sendNotification({
      to: recipient,
      templateId: 'default',
      variables: { message },
      priority: 'normal',
    });

    this.metricsService.incrementCounter('notifications_sent', 1);
  }

  async searchData(query: string, filters?: any): Promise<Result<any>> {
    try {
      const results = await this.searchService.search(query, filters);
      return Result.ok(results);
    } catch (error) {
      return Result.fail(`Search failed: ${error}`);
    }
  }

  async getSystemHealth(): Promise<Result<any>> {
    try {
      const health = await this.healthService.check();
      return Result.ok(health);
    } catch (error) {
      return Result.fail(`Health check failed: ${error}`);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
