import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cache_ttl';

export interface CacheOptions {
  ttl?: number;
  key?: string;
}

export const Cache = (options: CacheOptions = {}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, true)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_KEY, options.ttl || 300)(target, propertyKey, descriptor);
    
    const originalMethod = descriptor.value;
    const cacheKey = options.key || `${target.constructor.name}:${propertyKey}`;
    
    descriptor.value = async function (...args: any[]) {
      // Cache implementation would go here
      // For now, just call the original method
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
};