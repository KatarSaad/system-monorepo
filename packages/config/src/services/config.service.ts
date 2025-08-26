import { Injectable, Optional } from '@nestjs/common';
import { CacheService } from '@katarsaad/core';

export interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object';
    default?: any;
    required?: boolean;
    validation?: (value: any) => boolean;
  };
}

@Injectable()
export class ConfigService {
  private config = new Map<string, any>();
  private schema = new Map<string, ConfigSchema>();

  constructor(@Optional() private cacheService: CacheService) {
    this.loadEnvironmentConfig();
  }

  registerSchema(namespace: string, schema: ConfigSchema): void {
    this.schema.set(namespace, schema);
    this.validateNamespace(namespace);
  }

  get<T = any>(key: string, defaultValue?: T): T {
    const value = this.config.get(key);
    return value !== undefined ? value : defaultValue!;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
    if (this.cacheService) {
      this.cacheService.invalidateByPattern(new RegExp(`config:${key.split('.')[0]}:.*`));
    }
  }

  getNamespace(namespace: string): Record<string, any> {
    const result: Record<string, any> = {};
    const prefix = `${namespace}.`;
    
    for (const [key, value] of this.config.entries()) {
      if (key.startsWith(prefix)) {
        const subKey = key.substring(prefix.length);
        result[subKey] = value;
      }
    }
    
    return result;
  }

  private loadEnvironmentConfig(): void {
    // Database
    this.config.set('database.url', process.env.DATABASE_URL);
    this.config.set('database.pool_size', parseInt(process.env.DB_POOL_SIZE || '10'));
    
    // Redis
    this.config.set('redis.url', process.env.REDIS_URL);
    this.config.set('redis.ttl', parseInt(process.env.REDIS_TTL || '3600'));
    
    // Security
    this.config.set('security.jwt_secret', process.env.JWT_SECRET);
    this.config.set('security.encryption_key', process.env.ENCRYPTION_KEY);
    
    // Features
    this.config.set('features.rate_limiting', process.env.RATE_LIMITING_ENABLED === 'true');
    this.config.set('features.audit_logging', process.env.AUDIT_LOGGING_ENABLED !== 'false');
    
    // Monitoring
    this.config.set('monitoring.metrics_enabled', process.env.METRICS_ENABLED !== 'false');
    this.config.set('monitoring.prometheus_port', parseInt(process.env.PROMETHEUS_PORT || '9090'));
  }

  private validateNamespace(namespace: string): void {
    const schema = this.schema.get(namespace);
    if (!schema) return;

    const config = this.getNamespace(namespace);
    
    for (const [key, definition] of Object.entries(schema)) {
      const value = config[key];
      
      if (definition.required && value === undefined) {
        throw new Error(`Required config missing: ${namespace}.${key}`);
      }
      
      if (value !== undefined && definition.validation && !definition.validation(value)) {
        throw new Error(`Invalid config value: ${namespace}.${key}`);
      }
      
      if (value === undefined && definition.default !== undefined) {
        this.config.set(`${namespace}.${key}`, definition.default);
      }
    }
  }
}