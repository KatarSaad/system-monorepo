import { Injectable } from "@nestjs/common";

interface ICacheOptions {
  ttl?: number;
  tags?: string[];
}

export interface ICacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
}

@Injectable()
export class CacheService {
  private cache = new Map<
    string,
    { value: any; expires: number; tags: string[] }
  >();
  private stats = { hits: 0, misses: 0 };

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item || Date.now() > item.expires) {
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  async set<T>(
    key: string,
    value: T,
    options: ICacheOptions = {}
  ): Promise<void> {
    const { ttl = 3600, tags = [] } = options;
    const expires = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expires, tags });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  async invalidateByTag(tag: string): Promise<number> {
    let invalidated = 0;

    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  async getStats(): Promise<ICacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalKeys: this.cache.size,
    };
  }
}
