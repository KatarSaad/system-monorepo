import { Injectable } from '@nestjs/common';
import { Result } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'default-secret';
  private readonly expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  constructor(private metrics: MetricsService) {}

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): Result<string> {
    try {
      // Simple JWT implementation for demo
      const header = { alg: 'HS256', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const exp = now + (24 * 60 * 60); // 24 hours
      
      const fullPayload = { ...payload, iat: now, exp };
      
      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
      const token = `${encodedHeader}.${encodedPayload}.signature`;
      
      this.metrics.incrementCounter('jwt_signed', 1);
      return Result.ok(token);
    } catch (error) {
      this.metrics.incrementCounter('jwt_sign_failed', 1);
      return Result.fail(`JWT signing failed: ${error}`);
    }
  }

  verify(token: string): Result<JwtPayload> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      this.metrics.incrementCounter('jwt_verified', 1);
      return Result.ok(payload);
    } catch (error) {
      this.metrics.incrementCounter('jwt_verify_failed', 1);
      return Result.fail(`JWT verification failed: ${error}`);
    }
  }

  decode(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    } catch {
      return null;
    }
  }
}