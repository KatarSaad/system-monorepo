import { Injectable } from '@nestjs/common';
import { DomainEvent as IDomainEvent } from '../interfaces/event.interface';
import { EventStoreService } from './event-store.service';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class EventReplayService {
  constructor(
    private eventStore: EventStoreService,
    private metrics: MetricsService
  ) {}

  async replayEvents(streamId: string, fromVersion = 0): Promise<any> {
    try {
      const events = await this.eventStore.getEvents(streamId);
      const state = await this.reconstructState(events);
      
      this.metrics.incrementCounter('event_replay', 1, { 
        streamId,
        eventCount: events.length.toString()
      });
      
      return state;
    } catch (error) {
      this.metrics.incrementCounter('event_replay_failed', 1);
      throw error;
    }
  }

  async replayAllEvents(fromPosition = 0): Promise<any[]> {
    try {
      const events = await this.eventStore.getAllEvents();
      
      this.metrics.incrementCounter('event_replay_all', 1, {
        eventCount: events.length.toString()
      });
      
      return events;
    } catch (error) {
      this.metrics.incrementCounter('event_replay_all_failed', 1);
      throw error;
    }
  }

  private async reconstructState(events: any[]): Promise<any> {
    const state: any = {};
    
    for (const event of events) {
      switch (event.type) {
        case 'UserCreated':
          state.id = event.aggregateId;
          state.email = event.payload.email;
          state.name = event.payload.name;
          state.createdAt = event.timestamp;
          break;
        case 'UserUpdated':
          Object.assign(state, event.payload);
          state.updatedAt = event.timestamp;
          break;
        case 'UserDeleted':
          state.deletedAt = event.timestamp;
          state.isDeleted = true;
          break;
      }
    }
    
    return state;
  }
}