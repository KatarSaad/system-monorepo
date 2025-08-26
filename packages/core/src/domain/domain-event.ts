import { v4 as uuid } from 'uuid';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor() {
    this.eventId = uuid();
    this.occurredOn = new Date();
  }
}