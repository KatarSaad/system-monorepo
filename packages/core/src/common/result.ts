export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _error?: string,
    private readonly _value?: T
  ) {}

  static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get error(): string {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  map<U>(fn: (value: T) => U): Result<U> {
    if (this._isSuccess) {
      return Result.ok(fn(this._value!));
    }
    return Result.fail(this._error!);
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this._isSuccess) {
      return fn(this._value!);
    }
    return Result.fail(this._error!);
  }
}