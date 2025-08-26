import { Injectable } from '@nestjs/common';
import { NotificationPayload, NotificationResult } from '../interfaces/notification.interface';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class EmailAdapter {
  constructor(private metrics: MetricsService) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Mock email sending - replace with actual SMTP/SendGrid implementation
      console.log(`Sending email to: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Message: ${payload.message}`);

      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

      this.metrics.incrementCounter('email_sent', 1, {
        priority: payload.priority || 'normal'
      });

      return {
        id: `email_${Date.now()}`,
        status: 'sent',
        channel: 'email',
        recipient: Array.isArray(payload.to) ? payload.to[0] : payload.to,
        sentAt: new Date()
      };
    } catch (error) {
      this.metrics.incrementCounter('email_failed', 1);
      
      return {
        id: `email_${Date.now()}`,
        status: 'failed',
        channel: 'email',
        recipient: Array.isArray(payload.to) ? payload.to[0] : payload.to,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    const results = await Promise.all(
      payloads.map(payload => this.send(payload))
    );

    this.metrics.incrementCounter('email_bulk_sent', 1, {
      count: payloads.length.toString()
    });

    return results;
  }
}