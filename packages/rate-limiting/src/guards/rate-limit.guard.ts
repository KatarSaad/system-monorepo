import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static readonly cache = new Map<string, number[]>();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    };

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const key = this.generateKey(request, 'api');
    const result = this.checkLimit(key, config);

    // Set rate limit headers
    response.setHeader('X-RateLimit-Limit', config.maxRequests);
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Reset', result.resetTime.toISOString());

    if (!result.allowed) {
      throw new HttpException({
        message: 'Too many requests',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        retryAfter: result.resetTime
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private generateKey(req: any, prefix = 'default'): string {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `${prefix}:${ip}:${userId}`;
  }

  private checkLimit(key: string, config: { windowMs: number; maxRequests: number }) {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let requests = RateLimitGuard.cache.get(key) || [];
    requests = requests.filter(timestamp => timestamp > windowStart);

    const allowed = requests.length < config.maxRequests;
    
    if (allowed) {
      requests.push(now);
    }

    RateLimitGuard.cache.set(key, requests);

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - requests.length),
      resetTime: new Date(windowStart + config.windowMs),
      totalHits: requests.length
    };
  }
}