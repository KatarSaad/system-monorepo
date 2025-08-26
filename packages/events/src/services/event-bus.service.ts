import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

@Injectable()
export class EventBusService {
  private eventStream = new Subject<DomainEvent>();

  publish(event: DomainEvent): void {
    this.eventStream.next(event);
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void> | void
  ): void {
    this.eventStream
      .pipe(filter(event => event.eventType === eventType))
      .subscribe(event => handler(event as T));
  }

  getEventStream(): Observable<DomainEvent> {
    return this.eventStream.asObservable();
  }
}