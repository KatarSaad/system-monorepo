import { Module, Global } from '@nestjs/common';
import { EventBusService } from './services/event-bus.service';
import { MessageQueueService } from './services/message-queue.service';
import { EventStoreService } from './services/event-store.service';
import { EventReplayService } from './services/event-replay.service';
import { MonitoringModule } from '@katarsaad/monitoring';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule, CoreModule],
  providers: [
    EventBusService,
    MessageQueueService,
    EventStoreService,
    EventReplayService,
  ],
  exports: [
    EventBusService,
    MessageQueueService,
    EventStoreService,
    EventReplayService,
  ],
})
export class EventsModule {}