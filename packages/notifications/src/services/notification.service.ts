import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventBusService } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms' | 'push';
}

export interface NotificationData {
  to: string;
  templateId: string;
  variables: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly templates = new Map<string, NotificationTemplate>();

  constructor(
    @Optional() private eventBus: EventBusService,
    @Optional() private metricsService: MetricsService
  ) {
    this.initializeMetrics();
  }

  registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  async sendNotification(data: NotificationData): Promise<void> {
    const template = this.templates.get(data.templateId);
    if (!template) {
      throw new Error(`Template ${data.templateId} not found`);
    }

    const processedSubject = this.processTemplate(template.subject, data.variables);
    const processedBody = this.processTemplate(template.body, data.variables);

    await this.sendByType(template.type, data.to, processedSubject, processedBody);
    
    if (this.metricsService) {
      this.metricsService.incrementCounter('notification_sent', 1, { type: template.type });
    }
    
    if (this.eventBus) {
      this.eventBus.publish({
        id: this.generateId(),
        type: 'NotificationSent',
        aggregateId: this.generateId(),
        aggregateType: 'Notification',
        version: 1,
        occurredOn: new Date(),
        data: { to: data.to, templateId: template.id, type: template.type }
      });
    }
  }

  private async sendByType(type: string, to: string, subject: string, body: string): Promise<void> {
    switch (type) {
      case 'email':
        this.logger.log(`Sending email to ${to}: ${subject}`);
        break;
      case 'sms':
        this.logger.log(`Sending SMS to ${to}: ${body}`);
        break;
      case 'push':
        this.logger.log(`Sending push to ${to}: ${subject}`);
        break;
    }
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private initializeMetrics(): void {
    if (this.metricsService) {
      this.metricsService.createCounter('notification_sent', 'Notifications sent successfully');
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}