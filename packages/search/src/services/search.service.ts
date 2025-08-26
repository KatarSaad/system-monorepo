import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { Result, CacheService } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';

export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  took: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private indices = new Map<string, any[]>();

  constructor(
    @Optional() private cacheService: CacheService,
    @Optional() private metricsService?: MetricsService
  ) {
    this.indices = new Map<string, any[]>();
    this.initializeMetrics();
  }

  async search<T>(index: string, query: SearchQuery): Promise<Result<SearchResult<T>>> {
    const startTime = Date.now();
    
    if (!this.indices) {
      this.indices = new Map<string, any[]>();
    }
    
    const cacheKey = `search:${index}:${JSON.stringify(query)}`;
    
    try {
      const cached = await this.cacheService?.get(cacheKey);
      if (cached?.isSuccess && cached.value) {
        this.metricsService?.incrementCounter('search_cache_hit', 1, { index });
        return Result.ok(cached.value as SearchResult<T>);
      }
    } catch (cacheError: any) {
      this.logger.warn('Cache service unavailable, continuing without cache', { error: cacheError?.message || 'Unknown error' });
    }

    try {
      const data = this.indices.get(index) || [];
      let filtered = this.filterData(data, query);
      
      if (query.sort) {
        filtered = this.sortData(filtered, query.sort);
      }

      const total = filtered.length;
      const page = query.page || 1;
      const limit = query.limit || 10;
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      const result: SearchResult<T> = {
        data: paginatedData,
        total,
        page,
        limit,
        took: Date.now() - startTime
      };

      try {
        await this.cacheService?.set(cacheKey, result, { ttl: 300 });
      } catch (cacheError: any) {
        this.logger.warn('Failed to cache search result', { error: cacheError?.message || 'Unknown error' });
      }
      
      this.metricsService?.incrementCounter('search_queries', 1, { index });
      this.metricsService?.observeHistogram('search_duration', result.took, 
        [10, 50, 100, 500, 1000], 'Search duration', { index });

      return Result.ok(result);
    } catch (error) {
      this.metricsService?.incrementCounter('search_errors', 1, { index });
      return Result.fail(`Search failed: ${error}`);
    }
  }

  async indexDocument(index: string, document: any): Promise<Result<void>> {
    try {
      if (!this.indices) {
        this.indices = new Map<string, any[]>();
      }
      
      if (!this.indices.has(index)) {
        this.indices.set(index, []);
      }
      
      this.indices.get(index)!.push(document);
      
      try {
        await this.cacheService?.invalidateByPattern(new RegExp(`search:${index}:.*`));
      } catch (cacheError: any) {
        this.logger.warn('Failed to invalidate cache', { error: cacheError?.message || 'Unknown error' });
      }
      
      this.metricsService?.incrementCounter('documents_indexed', 1, { index });
      return Result.ok();
    } catch (error) {
      return Result.fail(`Indexing failed: ${error}`);
    }
  }

  private filterData(data: any[], query: SearchQuery): any[] {
    let filtered = data;

    if (query.query) {
      filtered = filtered.filter(item => 
        JSON.stringify(item).toLowerCase().includes(query.query.toLowerCase())
      );
    }

    if (query.filters) {
      filtered = filtered.filter(item => {
        return Object.entries(query.filters!).every(([key, value]) => 
          item[key] === value
        );
      });
    }

    return filtered;
  }

  private sortData(data: any[], sort: string): any[] {
    const [field, direction = 'asc'] = sort.split(':');
    return data.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'desc' ? -result : result;
    });
  }

  private initializeMetrics() {
    try {
      if (this.metricsService) {
        this.metricsService.createCounter('search_queries', 'Search queries executed');
        this.metricsService.createCounter('search_errors', 'Search errors');
        this.metricsService.createCounter('search_cache_hit', 'Search cache hits');
        this.metricsService.createCounter('documents_indexed', 'Documents indexed');
      }
    } catch (error) {
      this.logger.warn('Metrics service not available, continuing without metrics');
    }
  }
}