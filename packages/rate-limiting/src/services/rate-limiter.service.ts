import { Injectable, Logger } from '@nestjs/common';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  private readonly inMemoryCache = new Map<string, number[]>();

  constructor() {
    // No dependencies needed
  }

  async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create request history for this key
    let requests = this.inMemoryCache.get(key) || [];

    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);

    const allowed = requests.length < config.maxRequests;
    
    if (allowed) {
      requests.push(now);
    }

    // Update cache
    this.inMemoryCache.set(key, requests);

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - requests.length),
      resetTime: new Date(windowStart + config.windowMs),
      totalHits: requests.length
    };
  }

  async resetLimit(key: string): Promise<void> {
    this.inMemoryCache.delete(key);
  }

  generateKey(req: any, prefix = 'default'): string {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${prefix}:${ip}:${userId}`;
  }


}