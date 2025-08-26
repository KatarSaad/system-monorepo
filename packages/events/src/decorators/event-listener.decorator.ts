import { SetMetadata } from '@nestjs/common';

export const EVENT_LISTENER_METADATA = 'event_listener';

export interface EventListenerOptions {
  eventType: string;
  async?: boolean;
  retries?: number;
  timeout?: number;
}

export const EventListener = (options: EventListenerOptions) => 
  SetMetadata(EVENT_LISTENER_METADATA, options);