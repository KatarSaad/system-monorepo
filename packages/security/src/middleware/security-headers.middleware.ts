import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CSP header
    res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
    
    // HSTS header (only for HTTPS)
    if (req.secure) {
      res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  }
}