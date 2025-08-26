import { SetMetadata } from '@nestjs/common';
import { RateLimitConfig } from '../interfaces/rate-limit.interface';

export const RATE_LIMIT_KEY = 'rate_limit';

export const RateLimit = (config: Partial<RateLimitConfig>) => 
  SetMetadata(RATE_LIMIT_KEY, config);