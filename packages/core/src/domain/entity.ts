import { v4 as uuidv4 } from 'uuid';

export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id || uuidv4();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(entity: Entity<T>): boolean {
    if (!(entity instanceof Entity)) {
      return false;
    }

    return this._id === entity._id;
  }
}