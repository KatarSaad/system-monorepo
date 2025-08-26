import { Injectable } from '@nestjs/common';
import { BackupConfig } from '../interfaces/backup.interface';
import { BackupService } from './backup.service';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class BackupSchedulerService {
  private scheduledJobs = new Map<string, NodeJS.Timeout>();

  constructor(
    private backupService: BackupService,
    private metrics: MetricsService
  ) {}

  scheduleBackup(name: string, config: BackupConfig): void {
    this.cancelScheduledBackup(name);

    // Mock cron scheduling - replace with actual cron library
    const interval = this.parseCronToInterval(config.schedule);
    
    const job = setInterval(async () => {
      try {
        await this.backupService.createBackup({
          encrypt: config.encryption,
          compress: config.compression
        });
        this.metrics.incrementCounter('scheduled_backup_success', 1, { name });
      } catch (error) {
        this.metrics.incrementCounter('scheduled_backup_failed', 1, { name });
      }
    }, interval);

    this.scheduledJobs.set(name, job);
    this.metrics.incrementCounter('backup_scheduled', 1, { name });
  }

  cancelScheduledBackup(name: string): void {
    const job = this.scheduledJobs.get(name);
    if (job) {
      clearInterval(job);
      this.scheduledJobs.delete(name);
      this.metrics.incrementCounter('backup_unscheduled', 1, { name });
    }
  }

  getScheduledBackups(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  private parseCronToInterval(cron: string): number {
    // Simple cron parser - replace with proper cron library
    if (cron === '0 0 * * *') return 24 * 60 * 60 * 1000; // daily
    if (cron === '0 0 * * 0') return 7 * 24 * 60 * 60 * 1000; // weekly
    return 60 * 60 * 1000; // default hourly
  }
}