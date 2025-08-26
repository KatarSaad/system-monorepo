import { PrismaClient } from '@prisma/client';
import { RepositoryFactory } from './repository-factory';
import { QueryBuilderFactory } from './query-builder';
import { CacheService } from './cache.service';
import { IBaseRepository } from '../interfaces/repository.interface';

export interface InfrastructureConfig {
  database: {
    url: string;
    provider: 'mysql' | 'postgresql' | 'sqlite';
    pool?: {
      min: number;
      max: number;
    };
  };
  cache: {
    provider: 'memory' | 'redis';
    url?: string;
    ttl: number;
  };
  analytics: {
    enabled: boolean;
    retention: number;
  };
  audit: {
    enabled: boolean;
    exclude: string[];
  };
  models: Record<string, {
    cache?: { ttl: number; tags: string[] };
    audit?: { track: string[] };
    search?: { fields: string[] };
  }>;
}

export class Infrastructure {
  private prisma: PrismaClient;
  private repositoryFactory: RepositoryFactory;
  private queryBuilderFactory: QueryBuilderFactory;
  private cacheService: CacheService;
  private initialized = false;

  constructor(private config: InfrastructureConfig) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url
        }
      }
    });
    
    this.repositoryFactory = new RepositoryFactory(this.prisma);
    this.queryBuilderFactory = new QueryBuilderFactory(this.prisma);
    this.cacheService = new CacheService();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.prisma.$connect();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize infrastructure: ${error}`);
    }
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      await this.prisma.$disconnect();
      await this.cacheService.clear();
      this.initialized = false;
    } catch (error) {
      throw new Error(`Failed to shutdown infrastructure: ${error}`);
    }
  }

  repository<T>(modelName: string): IBaseRepository<T> {
    this.ensureInitialized();
    return this.repositoryFactory.create<T>(modelName);
  }

  query<T>(modelName: string) {
    this.ensureInitialized();
    return this.queryBuilderFactory.create<T>(modelName);
  }

  cache() {
    return this.cacheService;
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    this.ensureInitialized();
    return await this.prisma.$transaction(callback);
  }

  async executeRaw(query: string, ...params: any[]): Promise<any> {
    this.ensureInitialized();
    return await this.prisma.$queryRawUnsafe(query, ...params);
  }

  getAvailableModels(): string[] {
    return this.repositoryFactory.getAvailableModels();
  }

  getModelConfig(modelName: string) {
    return this.config.models[modelName] || {};
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    database: boolean;
    cache: boolean;
    timestamp: Date;
  }> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      const dbHealthy = true;

      // Test cache
      await this.cacheService.set('health_check', 'ok', { ttl: 10 });
      const cacheHealthy = await this.cacheService.get('health_check') === 'ok';

      return {
        status: dbHealthy && cacheHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy,
        cache: cacheHealthy,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: false,
        cache: false,
        timestamp: new Date()
      };
    }
  }

  async getMetrics() {
    const cacheStats = await this.cacheService.getStats();
    const models = this.getAvailableModels();
    
    return {
      cache: cacheStats,
      models: {
        available: models,
        count: models.length
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Infrastructure not initialized. Call initialize() first.');
    }
  }
}

// Factory function for easy setup
export function createInfrastructure(config: InfrastructureConfig): Infrastructure {
  return new Infrastructure(config);
}

// Default configuration
export const defaultConfig: Partial<InfrastructureConfig> = {
  cache: {
    provider: 'memory',
    ttl: 3600
  },
  analytics: {
    enabled: true,
    retention: 90
  },
  audit: {
    enabled: true,
    exclude: ['password', 'token', 'secret']
  }
};