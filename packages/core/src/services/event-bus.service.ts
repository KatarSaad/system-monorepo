import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, filter, map } from 'rxjs';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  occurredOn: Date;
  data: any;
  metadata?: Record<string, any>;
}

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void> | void;
}

export interface EventSubscription {
  unsubscribe(): void;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly eventStream = new Subject<DomainEvent>();
  private readonly handlers = new Map<string, EventHandler[]>();
  private readonly middlewares: Array<(event: DomainEvent) => Promise<DomainEvent | null>> = [];

  publish(event: DomainEvent): void {
    this.logger.debug(`Publishing event: ${event.type}`, { eventId: event.id });
    
    // Apply middlewares
    this.applyMiddlewares(event)
      .then(processedEvent => {
        if (processedEvent) {
          this.eventStream.next(processedEvent);
        }
      })
      .catch(error => {
        this.logger.error(`Error processing event ${event.id}:`, error);
      });
  }

  publishMany(events: DomainEvent[]): void {
    events.forEach(event => this.publish(event));
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler as EventHandler);
    
    const subscription = this.eventStream
      .pipe(
        filter(event => event.type === eventType),
        map(event => event as T)
      )
      .subscribe(async event => {
        try {
          await handler.handle(event);
          this.logger.debug(`Event handled: ${event.type}`, { eventId: event.id });
        } catch (error) {
          this.logger.error(`Error handling event ${event.id}:`, error);
        }
      });

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
        const handlers = this.handlers.get(eventType);
        if (handlers) {
          const index = handlers.indexOf(handler as EventHandler);
          if (index > -1) {
            handlers.splice(index, 1);
          }
        }
      }
    };
  }

  subscribeToAll(handler: EventHandler): EventSubscription {
    const subscription = this.eventStream.subscribe(async event => {
      try {
        await handler.handle(event);
      } catch (error) {
        this.logger.error(`Error in global handler for event ${event.id}:`, error);
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }

  addMiddleware(middleware: (event: DomainEvent) => Promise<DomainEvent | null>): void {
    this.middlewares.push(middleware);
  }

  getEventStream(): Observable<DomainEvent> {
    return this.eventStream.asObservable();
  }

  getEventsByType<T extends DomainEvent>(eventType: string): Observable<T> {
    return this.eventStream.pipe(
      filter(event => event.type === eventType),
      map(event => event as T)
    );
  }

  private async applyMiddlewares(event: DomainEvent): Promise<DomainEvent | null> {
    let processedEvent: DomainEvent | null = event;
    
    for (const middleware of this.middlewares) {
      if (processedEvent) {
        processedEvent = await middleware(processedEvent);
      }
    }
    
    return processedEvent;
  }

  clear(): void {
    this.handlers.clear();
    this.middlewares.length = 0;
  }
}