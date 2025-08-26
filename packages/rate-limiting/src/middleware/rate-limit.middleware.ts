import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from '../services/rate-limiter.service';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    private rateLimiter: RateLimiterService,
    private metrics: MetricsService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const key = this.generateKey(req);
    
    try {
      const result = await this.rateLimiter.checkLimit(key, {
        windowMs: 60000,
        maxRequests: 100
      });

      if (!result.allowed) {
        this.metrics.incrementCounter('rate_limit_exceeded', 1, { ip: req.ip || 'unknown' });
        throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
      }

      res.setHeader('X-RateLimit-Limit', '100');
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      this.metrics.incrementCounter('rate_limit_allowed', 1);
      next();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      next(error);
    }
  }

  private generateKey(req: Request): string {
    return `rate_limit:${req.ip}:${req.path}`;
  }
}