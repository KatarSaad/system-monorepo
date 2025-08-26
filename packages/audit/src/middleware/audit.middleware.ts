import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private auditService: AuditService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const auditService = this.auditService;
    
    // Capture original end method
    const originalEnd = res.end.bind(res);
    
    res.end = function(chunk?: any, encoding?: any): any {
      const duration = Date.now() - startTime;
      
      // Log the request/response
      setImmediate(async () => {
        try {
          await auditService.log({
            userId: (req as any).user?.id || 'anonymous',
            action: `${req.method}_${res.statusCode}`,
            resource: req.path,
            resourceId: req.params?.id || 'N/A',
            timestamp: new Date(),
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
              duration,
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip
            }
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });
      
      // Call original end method
      return originalEnd(chunk, encoding);
    };

    next();
  }
}