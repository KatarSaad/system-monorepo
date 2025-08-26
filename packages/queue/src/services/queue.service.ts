import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventBusService } from '@katarsaad/events';
import { MetricsService } from '@katarsaad/monitoring';

export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<string, QueueJob[]>();
  private readonly processing = new Map<string, boolean>();
  private readonly workers = new Map<string, (job: QueueJob) => Promise<void>>();

  constructor(
    @Optional() private eventBus: EventBusService,
    @Optional() private metricsService: MetricsService
  ) {
    this.initializeMetrics();
  }

  registerWorker<T>(jobType: string, worker: (job: QueueJob<T>) => Promise<void>): void {
    this.workers.set(jobType, worker);
  }

  async addJob<T>(queueName: string, jobType: string, data: T, options: Partial<QueueJob> = {}): Promise<string> {
    const job: QueueJob<T> = {
      id: this.generateJobId(),
      type: jobType,
      data,
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      delay: options.delay || 0,
      createdAt: new Date(),
      ...options
    };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    this.queues.get(queueName)!.push(job);
    this.sortQueue(queueName);

    if (this.metricsService) {
      this.metricsService.incrementCounter('queue_job_added', 1, { queue: queueName, type: jobType });
    }
    this.processQueue(queueName);
    return job.id;
  }

  private async processQueue(queueName: string): Promise<void> {
    if (this.processing.get(queueName)) return;
    
    this.processing.set(queueName, true);
    const queue = this.queues.get(queueName);
    
    if (!queue || queue.length === 0) {
      this.processing.set(queueName, false);
      return;
    }

    const job = queue.shift()!;
    const worker = this.workers.get(job.type);

    if (!worker) {
      this.processing.set(queueName, false);
      return;
    }

    try {
      job.processedAt = new Date();
      job.attempts++;
      await worker(job);
      job.completedAt = new Date();
      if (this.metricsService) {
        this.metricsService.incrementCounter('queue_job_completed', 1, { queue: queueName, type: job.type });
      }
    } catch (error) {
      job.error = String(error);
      job.failedAt = new Date();
      if (this.metricsService) {
        this.metricsService.incrementCounter('queue_job_failed', 1, { queue: queueName, type: job.type });
      }
      
      if (job.attempts < job.maxAttempts) {
        setTimeout(() => {
          queue.unshift(job);
          this.sortQueue(queueName);
        }, 5000);
      }
    }

    this.processing.set(queueName, false);
    if (queue.length > 0) {
      setImmediate(() => this.processQueue(queueName));
    }
  }

  private sortQueue(queueName: string): void {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime());
    }
  }

  private initializeMetrics(): void {
    if (this.metricsService) {
      this.metricsService.createCounter('queue_job_added', 'Jobs added to queue');
      this.metricsService.createCounter('queue_job_completed', 'Jobs completed successfully');
      this.metricsService.createCounter('queue_job_failed', 'Jobs that failed');
    }
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}