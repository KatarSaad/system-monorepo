import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../services/validation.service';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  constructor(
    private validationService: ValidationService,
    private metrics: MetricsService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body if present
      if (req.body && Object.keys(req.body).length > 0) {
        await this.validateRequestBody(req.body);
      }

      // Validate query parameters
      if (req.query && Object.keys(req.query).length > 0) {
        await this.validateQueryParams(req.query);
      }

      this.metrics.incrementCounter('validation_middleware_success', 1);
      next();
    } catch (error) {
      this.metrics.incrementCounter('validation_middleware_failed', 1);
      throw new BadRequestException(error instanceof Error ? error.message : 'Validation failed');
    }
  }

  private async validateRequestBody(body: any): Promise<void> {
    // Simple validation for demo
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      throw new Error('Invalid email format');
    }
    if (body.password && body.password.length < 3) {
      throw new Error('Password too short');
    }
  }

  private async validateQueryParams(query: any): Promise<void> {
    // Basic query parameter validation
    if (query.page && isNaN(Number(query.page))) {
      throw new Error('Page must be a number');
    }
    
    if (query.limit && isNaN(Number(query.limit))) {
      throw new Error('Limit must be a number');
    }
  }
}