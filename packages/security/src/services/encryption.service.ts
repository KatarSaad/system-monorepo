import { Injectable, Logger } from '@nestjs/common';
import { createCipher, createDecipher, createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Result } from '@katarsaad/core';

const scryptAsync = promisify(scrypt);

export interface EncryptionOptions {
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
  tagLength?: number;
  iterations?: number;
  saltLength?: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt?: string;
  tag?: string;
  algorithm: string;
}

export interface HashOptions {
  algorithm?: string;
  salt?: string;
  iterations?: number;
  keyLength?: number;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly defaultOptions: Required<EncryptionOptions> = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    iterations: 100000,
    saltLength: 32,
  };

  async encrypt(
    data: string,
    password: string,
    options: EncryptionOptions = {}
  ): Promise<Result<EncryptedData>> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const salt = randomBytes(opts.saltLength);
      const iv = randomBytes(opts.ivLength);
      
      const key = await scryptAsync(password, salt, opts.keyLength) as Buffer;
      const cipher = createCipher(opts.algorithm, key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const result: EncryptedData = {
        data: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        algorithm: opts.algorithm,
      };

      return Result.ok(result);
    } catch (error) {
      return Result.fail(`Encryption failed: ${error}`);
    }
  }

  async decrypt(encryptedData: EncryptedData, password: string): Promise<Result<string>> {
    try {
      const salt = Buffer.from(encryptedData.salt!, 'hex');
      const key = await scryptAsync(password, salt, this.defaultOptions.keyLength) as Buffer;
      const decipher = createDecipher(encryptedData.algorithm, key);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return Result.ok(decrypted);
    } catch (error) {
      return Result.fail(`Decryption failed: ${error}`);
    }
  }

  hash(data: string, options: HashOptions = {}): Result<string> {
    try {
      const { algorithm = 'sha256', salt = '' } = options;
      const hash = createHash(algorithm);
      hash.update(data + salt);
      return Result.ok(hash.digest('hex'));
    } catch (error) {
      return Result.fail(`Hashing failed: ${error}`);
    }
  }

  async hashPassword(password: string, options: HashOptions = {}): Promise<Result<{ hash: string; salt: string }>> {
    try {
      const { keyLength = 64 } = options;
      const salt = options.salt || randomBytes(32).toString('hex');
      const saltBuffer = Buffer.from(salt, 'hex');
      const hash = await scryptAsync(password, saltBuffer, keyLength) as Buffer;
      
      return Result.ok({ hash: hash.toString('hex'), salt });
    } catch (error) {
      return Result.fail(`Password hashing failed: ${error}`);
    }
  }

  async verifyPassword(password: string, hash: string, salt: string, keyLength: number = 64): Promise<Result<boolean>> {
    try {
      const saltBuffer = Buffer.from(salt, 'hex');
      const hashBuffer = Buffer.from(hash, 'hex');
      const derivedKey = await scryptAsync(password, saltBuffer, keyLength) as Buffer;
      const isValid = timingSafeEqual(hashBuffer, derivedKey);
      return Result.ok(isValid);
    } catch (error) {
      return Result.fail(`Password verification failed: ${error}`);
    }
  }

  generateRandomBytes(length: number): Result<string> {
    try {
      return Result.ok(randomBytes(length).toString('hex'));
    } catch (error) {
      return Result.fail(`Random bytes generation failed: ${error}`);
    }
  }

  generateSecureToken(length: number = 32): Result<string> {
    try {
      return Result.ok(randomBytes(length).toString('base64url'));
    } catch (error) {
      return Result.fail(`Secure token generation failed: ${error}`);
    }
  }
}