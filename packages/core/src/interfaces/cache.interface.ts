import { Result } from '../common/result';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
  serialize?: boolean;
}

export interface ICacheService {
  get<T>(key: string): Promise<Result<T | null>>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<Result<void>>;
  delete(key: string): Promise<Result<boolean>>;
  has(key: string): Promise<Result<boolean>>;
  clear(): Promise<Result<void>>;
  invalidateByTag(tag: string): Promise<Result<number>>;
  getOrSet<T>(key: string, factory: () => Promise<T> | T, options?: CacheOptions): Promise<Result<T>>;
}