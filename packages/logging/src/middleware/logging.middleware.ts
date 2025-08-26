import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../services/logging.service';
import { LogLevel } from '../interfaces/logging.interface';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string || this.generateCorrelationId();
    
    // Add correlation ID to request
    (req as any).correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Log request
    this.loggingService.log({
      level: LogLevel.INFO,
      message: `${req.method} ${req.url}`,
      timestamp: new Date(),
      correlationId,
      userId: (req as any).user?.id,
      metadata: {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    // Override res.end to log response
    const originalEnd = res.end;
    const self = this;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      self.loggingService.log({
        level: LogLevel.INFO,
        message: `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
        timestamp: new Date(),
        correlationId,
        userId: (req as any).user?.id,
        metadata: {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration
        }
      });

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}