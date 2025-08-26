import { Module, Global } from '@nestjs/common';
import { QueueService } from './services/queue.service';
import { QueueSchedulerService } from './services/queue-scheduler.service';
import { MonitoringModule } from '@katarsaad/monitoring';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), CoreModule],
  providers: [QueueService, QueueSchedulerService],
  exports: [QueueService, QueueSchedulerService],
})
export class QueueModule {}