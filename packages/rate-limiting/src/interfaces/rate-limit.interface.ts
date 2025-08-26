export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface RateLimitStrategy {
  name: string;
  windowMs: number;
  max: number;
  storage: 'memory' | 'redis';
}

export interface RateLimitStorage {
  increment(key: string): Promise<{ totalHits: number; timeToExpire: number }>;
  decrement(key: string): Promise<void>;
  resetKey(key: string): Promise<void>;
}