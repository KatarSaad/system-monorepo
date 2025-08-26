import { Injectable, Logger } from '@nestjs/common';
import { Result } from '../common/result';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
  serialize?: boolean; // Custom serialization
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  totalKeys: number;
}

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
    totalKeys: 0,
  };
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.startCleanupInterval();
  }

  async get<T>(key: string): Promise<Result<T | null>> {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        this.updateHitRate();
        return Result.ok(null);
      }

      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.stats.misses++;
        this.stats.totalKeys--;
        this.updateHitRate();
        return Result.ok(null);
      }

      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.stats.hits++;
      this.updateHitRate();

      return Result.ok(entry.value as T);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return Result.fail(`Cache get failed: ${error}`);
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<Result<void>> {
    try {
      const { ttl = 3600, tags = [], compress = false, serialize = true } = options;
      
      let processedValue = value;
      if (serialize && typeof value === 'object') {
        processedValue = JSON.parse(JSON.stringify(value)) as T;
      }

      const entry: CacheEntry<T> = {
        value: processedValue,
        expiresAt: Date.now() + (ttl * 1000),
        tags,
        createdAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      const wasNew = !this.cache.has(key);
      this.cache.set(key, entry);
      
      if (wasNew) {
        this.stats.totalKeys++;
      }
      this.stats.sets++;

      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s, Tags: ${tags.join(', ')})`);
      return Result.ok();
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      return Result.fail(`Cache set failed: ${error}`);
    }
  }

  async delete(key: string): Promise<Result<boolean>> {
    try {
      const existed = this.cache.delete(key);
      if (existed) {
        this.stats.deletes++;
        this.stats.totalKeys--;
        this.logger.debug(`Cache deleted: ${key}`);
      }
      return Result.ok(existed);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return Result.fail(`Cache delete failed: ${error}`);
    }
  }

  async has(key: string): Promise<Result<boolean>> {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        return Result.ok(false);
      }

      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.stats.totalKeys--;
        return Result.ok(false);
      }

      return Result.ok(true);
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}:`, error);
      return Result.fail(`Cache has failed: ${error}`);
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      const keyCount = this.cache.size;
      this.cache.clear();
      this.stats.totalKeys = 0;
      this.logger.debug(`Cache cleared: ${keyCount} keys removed`);
      return Result.ok();
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      return Result.fail(`Cache clear failed: ${error}`);
    }
  }

  async invalidateByTag(tag: string): Promise<Result<number>> {
    try {
      let invalidated = 0;
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (entry.tags.includes(tag)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key);
        invalidated++;
      }

      this.stats.totalKeys -= invalidated;
      this.logger.debug(`Cache invalidated by tag '${tag}': ${invalidated} keys`);
      return Result.ok(invalidated);
    } catch (error) {
      this.logger.error(`Error invalidating cache by tag ${tag}:`, error);
      return Result.fail(`Cache invalidation failed: ${error}`);
    }
  }

  async invalidateByPattern(pattern: RegExp): Promise<Result<number>> {
    try {
      let invalidated = 0;
      const keysToDelete: string[] = [];

      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key);
        invalidated++;
      }

      this.stats.totalKeys -= invalidated;
      this.logger.debug(`Cache invalidated by pattern: ${invalidated} keys`);
      return Result.ok(invalidated);
    } catch (error) {
      this.logger.error(`Error invalidating cache by pattern:`, error);
      return Result.fail(`Cache pattern invalidation failed: ${error}`);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<Result<T>> {
    const cached = await this.get<T>(key);
    
    if (cached.isSuccess && cached.value !== null) {
      return Result.ok(cached.value);
    }

    try {
      const value = await factory();
      const setResult = await this.set(key, value, options);
      
      if (setResult.isFailure) {
        return Result.fail(setResult.error);
      }

      return Result.ok(value);
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      return Result.fail(`GetOrSet failed: ${error}`);
    }
  }

  async mget<T>(keys: string[]): Promise<Result<Map<string, T>>> {
    try {
      const results = new Map<string, T>();
      
      for (const key of keys) {
        const result = await this.get<T>(key);
        if (result.isSuccess && result.value !== null) {
          results.set(key, result.value);
        }
      }

      return Result.ok(results);
    } catch (error) {
      this.logger.error('Error in mget:', error);
      return Result.fail(`Multi-get failed: ${error}`);
    }
  }

  async mset<T>(entries: Map<string, T>, options: CacheOptions = {}): Promise<Result<void>> {
    try {
      for (const [key, value] of entries) {
        const result = await this.set(key, value, options);
        if (result.isFailure) {
          return result;
        }
      }
      return Result.ok();
    } catch (error) {
      this.logger.error('Error in mset:', error);
      return Result.fail(`Multi-set failed: ${error}`);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.sets = 0;
    this.stats.deletes = 0;
    this.stats.hitRate = 0;
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getKeysByTag(tag: string): string[] {
    const keys: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        keys.push(key);
      }
    }
    return keys;
  }

  getSize(): number {
    return this.cache.size;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private cleanup(): void {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.stats.totalKeys -= keysToDelete.length;
      this.logger.debug(`Cache cleanup: removed ${keysToDelete.length} expired keys`);
    }
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}