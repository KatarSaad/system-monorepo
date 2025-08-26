import * as crypto from 'crypto';
import { Buffer } from 'buffer';
// Lazy load bcrypt to avoid type issues
let bcrypt: any = null;
try {
  bcrypt = require('bcrypt');
} catch (error) {
  // bcrypt not available
}
import { Result } from '../common/result';

export class CryptoService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ALGORITHM = 'aes-256-gcm';

  static async hashPassword(password: string): Promise<Result<string>> {
    try {
      if (!bcrypt) {
        return Result.fail('bcrypt not available');
      }
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      return Result.ok(hash);
    } catch (error) {
      return Result.fail('Failed to hash password');
    }
  }

  static async verifyPassword(password: string, hash: string): Promise<Result<boolean>> {
    try {
      if (!bcrypt) {
        return Result.fail('bcrypt not available');
      }
      const isValid = await bcrypt.compare(password, hash);
      return Result.ok(isValid);
    } catch (error) {
      return Result.fail('Failed to verify password');
    }
  }

  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static encrypt(text: string, key: string): Result<{ encrypted: string; iv: string; tag: string }> {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(key).subarray(0, 32), iv);
      cipher.setAAD(Buffer.from('additional-data'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return Result.ok({
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      });
    } catch (error) {
      return Result.fail('Encryption failed');
    }
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): Result<string> {
    try {
      const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(key).subarray(0, 32), Buffer.from(encryptedData.iv, 'hex'));
      decipher.setAAD(Buffer.from('additional-data'));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return Result.ok(decrypted);
    } catch (error) {
      return Result.fail('Decryption failed');
    }
  }

  static createHash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static createHMAC(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }
}

