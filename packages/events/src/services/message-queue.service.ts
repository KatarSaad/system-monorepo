import { Injectable } from '@nestjs/common';

export interface QueueMessage {
  id: string;
  payload: any;
  priority: number;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

@Injectable()
export class MessageQueueService {
  private queues = new Map<string, QueueMessage[]>();

  async enqueue(queueName: string, message: Omit<QueueMessage, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    const queue = this.queues.get(queueName)!;
    const queueMessage: QueueMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
      retryCount: 0,
    };

    queue.push(queueMessage);
    queue.sort((a, b) => b.priority - a.priority);
  }

  async dequeue(queueName: string): Promise<QueueMessage | null> {
    const queue = this.queues.get(queueName);
    return queue?.shift() || null;
  }

  async getQueueSize(queueName: string): Promise<number> {
    return this.queues.get(queueName)?.length || 0;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}