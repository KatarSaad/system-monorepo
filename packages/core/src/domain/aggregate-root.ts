import { Entity } from './entity';
import { DomainEvent } from './domain-event';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  protected removeDomainEvent(event: DomainEvent): void {
    const index = this._domainEvents.indexOf(event);
    if (index !== -1) {
      this._domainEvents.splice(index, 1);
    }
  }
}