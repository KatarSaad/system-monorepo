import { Injectable } from '@nestjs/common';
import { Result } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  constructor(private metrics: MetricsService) {}

  async hash(password: string): Promise<Result<string>> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      this.metrics.incrementCounter('password_hashed', 1);
      return Result.ok(hash);
    } catch (error) {
      this.metrics.incrementCounter('password_hash_failed', 1);
      return Result.fail(`Password hashing failed: ${error}`);
    }
  }

  async verify(password: string, hash: string): Promise<Result<boolean>> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      this.metrics.incrementCounter('password_verified', 1, { valid: isValid.toString() });
      return Result.ok(isValid);
    } catch (error) {
      this.metrics.incrementCounter('password_verify_failed', 1);
      return Result.fail(`Password verification failed: ${error}`);
    }
  }

  generateRandom(length = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}