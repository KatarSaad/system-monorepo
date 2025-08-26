import { Result } from '@katarsaad/core';

export interface HashResult {
  hash: string;
  salt: string;
}

export interface IEncryptionService {
  hashPassword(password: string): Promise<Result<HashResult>>;
  verifyPassword(password: string, hash: string): Promise<Result<boolean>>;
  encrypt(data: string): Promise<Result<string>>;
  decrypt(encryptedData: string): Promise<Result<string>>;
  generateSecureToken(length?: number): Result<string>;
}