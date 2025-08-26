export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  equals(vo: ValueObject<T>): boolean {
    if (!(vo instanceof ValueObject)) {
      return false;
    }

    return JSON.stringify(this._value) === JSON.stringify(vo._value);
  }

  toString(): string {
    return String(this._value);
  }
}