export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: any;
  metadata: EventMetadata;
  timestamp: Date;
}

export interface EventMetadata {
  userId?: string;
  correlationId?: string;
  causationId?: string;
  source: string;
  version: string;
}

export interface EventHandler<T = any> {
  handle(event: T): Promise<void>;
}