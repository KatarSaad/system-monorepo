import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueJob } from '../interfaces/queue.interface';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class QueueSchedulerService {
  private scheduledJobs = new Map<string, NodeJS.Timeout>();

  constructor(
    private queueService: QueueService,
    private metrics: MetricsService
  ) {}

  scheduleJob(name: string, data: any, cronExpression: string): void {
    this.cancelScheduledJob(name);

    const interval = this.parseCronToInterval(cronExpression);
    
    const job = setInterval(async () => {
      try {
        await this.queueService.addJob('scheduled', name, data);
        this.metrics.incrementCounter('scheduled_job_added', 1, { name });
      } catch (error) {
        this.metrics.incrementCounter('scheduled_job_failed', 1, { name });
      }
    }, interval);

    this.scheduledJobs.set(name, job);
    this.metrics.incrementCounter('job_scheduled', 1, { name });
  }

  scheduleDelayedJob(job: QueueJob, delayMs: number): void {
    setTimeout(async () => {
      try {
        await this.queueService.addJob('delayed', job.name, job.data);
        this.metrics.incrementCounter('delayed_job_added', 1, { name: job.name });
      } catch (error) {
        this.metrics.incrementCounter('delayed_job_failed', 1, { name: job.name });
      }
    }, delayMs);
  }

  cancelScheduledJob(name: string): void {
    const job = this.scheduledJobs.get(name);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(name);
      this.metrics.incrementCounter('job_unscheduled', 1, { name });
    }
  }

  getScheduledJobs(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  private parseCronToInterval(cron: string): number {
    if (cron === '0 0 * * *') return 24 * 60 * 60 * 1000; // daily
    if (cron === '0 0 * * 0') return 7 * 24 * 60 * 60 * 1000; // weekly
    if (cron === '0 * * * *') return 60 * 60 * 1000; // hourly
    return 60 * 1000; // default every minute
  }
}