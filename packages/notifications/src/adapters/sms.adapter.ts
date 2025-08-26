import { Injectable } from '@nestjs/common';
import { NotificationPayload, NotificationResult } from '../interfaces/notification.interface';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class SmsAdapter {
  constructor(private metrics: MetricsService) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // Mock SMS sending - replace with actual Twilio/AWS SNS implementation
      console.log(`Sending SMS to: ${payload.to}`);
      console.log(`Message: ${payload.message}`);

      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

      this.metrics.incrementCounter('sms_sent', 1, {
        priority: payload.priority || 'normal'
      });

      return {
        id: `sms_${Date.now()}`,
        status: 'sent',
        channel: 'sms',
        recipient: Array.isArray(payload.to) ? payload.to[0] : payload.to,
        sentAt: new Date()
      };
    } catch (error) {
      this.metrics.incrementCounter('sms_failed', 1);
      
      return {
        id: `sms_${Date.now()}`,
        status: 'failed',
        channel: 'sms',
        recipient: Array.isArray(payload.to) ? payload.to[0] : payload.to,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<NotificationResult[]> {
    const results = await Promise.all(
      payloads.map(payload => this.send(payload))
    );

    this.metrics.incrementCounter('sms_bulk_sent', 1, {
      count: payloads.length.toString()
    });

    return results;
  }
}