import { Injectable } from '@nestjs/common';
import { DomainEvent } from './event-bus.service';

@Injectable()
export class EventStoreService {
  private events: DomainEvent[] = [];

  async saveEvent(event: DomainEvent): Promise<void> {
    this.events.push(event);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.filter(event => event.aggregateId === aggregateId);
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    return this.events.filter(event => event.eventType === eventType);
  }

  async getAllEvents(): Promise<DomainEvent[]> {
    return [...this.events];
  }
}