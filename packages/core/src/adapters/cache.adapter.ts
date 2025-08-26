import { Result } from "../common/result";

export interface CacheAdapter {
  get<T>(key: string): Promise<Result<T | null>>;
  set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;
  delete(key: string): Promise<Result<void>>;
  exists(key: string): Promise<Result<boolean>>;
  clear(): Promise<Result<void>>;
  keys(pattern?: string): Promise<Result<string[]>>;
  increment(key: string, value?: number): Promise<Result<number>>;
  decrement(key: string, value?: number): Promise<Result<number>>;
  expire(key: string, ttl: number): Promise<Result<void>>;
}

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
  serialize?: boolean;
}

export abstract class BaseCacheService {
  constructor(
    protected readonly cache: CacheAdapter,
    protected readonly options: CacheOptions = {}
  ) {}

  protected buildKey(key: string): string {
    return this.options.prefix ? `${this.options.prefix}:${key}` : key;
  }

  async get<T>(key: string): Promise<Result<T | null>> {
    const cacheKey = this.buildKey(key);
    return this.cache.get<T>(cacheKey);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<Result<void>> {
    const cacheKey = this.buildKey(key);
    const cacheTtl = ttl || this.options.ttl;
    return this.cache.set(cacheKey, value, cacheTtl);
  }

  async delete(key: string): Promise<Result<void>> {
    const cacheKey = this.buildKey(key);
    return this.cache.delete(cacheKey);
  }

  async remember<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<Result<T>> {
    const cached = await this.get<T>(key);

    if (cached.isSuccess && cached.getValue() !== null) {
      return Result.ok(cached.getValue()!);
    }

    try {
      const value = await factory();
      await this.set(key, value, ttl);
      return Result.ok(value);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : "Cache factory failed"
      );
    }
  }

  async invalidatePattern(pattern: string): Promise<Result<void>> {
    try {
      const keysResult = await this.cache.keys(pattern);
      if (keysResult.isFailure) {
        return Result.fail(keysResult.error);
      }

      const keys = keysResult.getValue();
      const deletePromises = keys.map((key) => this.cache.delete(key));

      await Promise.all(deletePromises);
      return Result.ok();
    } catch (error) {
      return Result.fail("Failed to invalidate cache pattern");
    }
  }
}

export class CacheDecorator {
  static cache(options: CacheOptions & { key?: string } = {}) {
    return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor
    ) {
      const method = descriptor.value;

      descriptor.value = async function (this: any, ...args: any[]) {
        const cache: CacheAdapter = this.cache || this.cacheService;
        if (!cache) {
          return method.apply(this, args);
        }

        const cacheKey =
          options.key ||
          `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

        const cached = await cache.get(cacheKey);
        if (cached.isSuccess && cached.getValue() !== null) {
          return cached.getValue();
        }

        const result = await method.apply(this, args);
        await cache.set(cacheKey, result, options.ttl);

        return result;
      };
    };
  }

  static invalidate(pattern: string) {
    return function (
      target: any,
      propertyName: string,
      descriptor: PropertyDescriptor
    ) {
      const method = descriptor.value;

      descriptor.value = async function (this: any, ...args: any[]) {
        const result = await method.apply(this, args);

        const cache: CacheAdapter = this.cache || this.cacheService;
        if (cache) {
          await cache.keys(pattern).then((keysResult) => {
            if (keysResult.isSuccess) {
              const keys = keysResult.getValue();
              keys.forEach((key) => cache.delete(key));
            }
          });
        }

        return result;
      };
    };
  }
}
