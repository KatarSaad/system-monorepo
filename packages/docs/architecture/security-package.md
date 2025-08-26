# @system/security Package Architecture

## Overview
Security services for encryption, hashing, and cryptographic operations.

## Current Structure
```
src/
├── services/
│   └── encryption.service.ts
├── security.module.ts
└── index.ts
```

## Architecture Principles

### 1. **Security by Design**
- All operations return Result<T> for safe error handling
- No sensitive data in logs or error messages
- Constant-time operations for security-critical functions

### 2. **Abstraction Layer**
- Hide implementation details behind interfaces
- Allow algorithm swapping without breaking changes

## Best Practices

### ✅ **Module Structure**
```typescript
@Global()
@Module({
  providers: [
    {
      provide: IEncryptionService,
      useClass: EncryptionService,
    },
  ],
  exports: [IEncryptionService],
})
export class SecurityModule {}
```

### ✅ **Interface-First Design**
```typescript
export interface IEncryptionService {
  hashPassword(password: string): Promise<Result<HashResult>>;
  verifyPassword(password: string, hash: string): Promise<Result<boolean>>;
  encrypt(data: string): Promise<Result<string>>;
  decrypt(encryptedData: string): Promise<Result<string>>;
}
```

### ✅ **Secure Implementation**
```typescript
@Injectable()
export class EncryptionService implements IEncryptionService {
  async hashPassword(password: string): Promise<Result<HashResult>> {
    try {
      // Use secure random salt
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      
      return Result.ok({ hash, salt });
    } catch (error) {
      // Never log sensitive data
      this.logger.error('Password hashing failed');
      return Result.fail('Hashing operation failed');
    }
  }
}
```

## Transformation Guidelines

### 1. **Configuration Support**
```typescript
export interface SecurityModuleOptions {
  encryption?: {
    algorithm: 'AES-256-GCM' | 'AES-256-CBC';
    keyDerivation: 'PBKDF2' | 'scrypt';
  };
  hashing?: {
    rounds: number;
    algorithm: 'bcrypt' | 'argon2';
  };
}

@Module({})
export class SecurityModule {
  static forRoot(options?: SecurityModuleOptions): DynamicModule {
    return {
      module: SecurityModule,
      providers: [
        {
          provide: 'SECURITY_OPTIONS',
          useValue: { ...defaultOptions, ...options },
        },
        EncryptionService,
      ],
      exports: [EncryptionService],
    };
  }
}
```

### 2. **Key Management**
```typescript
@Injectable()
export class KeyManagementService {
  private keys = new Map<string, CryptoKey>();

  async rotateKey(keyId: string): Promise<Result<void>> {
    // Implement key rotation
  }

  async getKey(keyId: string): Promise<Result<CryptoKey>> {
    // Secure key retrieval
  }
}
```

### 3. **Audit Integration**
```typescript
@Injectable()
export class EncryptionService {
  constructor(
    @Inject('SECURITY_OPTIONS') private options: SecurityModuleOptions,
    private auditService: AuditService
  ) {}

  async encrypt(data: string): Promise<Result<string>> {
    const result = await this.performEncryption(data);
    
    // Audit security operations
    await this.auditService.log({
      action: 'ENCRYPT',
      resource: 'data',
      success: result.isSuccess,
    });

    return result;
  }
}
```

## Security Patterns

### 1. **Constant-Time Operations**
```typescript
async verifyPassword(password: string, hash: string): Promise<Result<boolean>> {
  try {
    // Use constant-time comparison
    const isValid = await bcrypt.compare(password, hash);
    return Result.ok(isValid);
  } catch (error) {
    return Result.fail('Verification failed');
  }
}
```

### 2. **Secure Random Generation**
```typescript
generateSecureToken(length: number = 32): Result<string> {
  try {
    const buffer = crypto.randomBytes(length);
    return Result.ok(buffer.toString('hex'));
  } catch (error) {
    return Result.fail('Token generation failed');
  }
}
```

### 3. **Data Sanitization**
```typescript
sanitizeForLogging(data: any): any {
  const sensitive = ['password', 'token', 'key', 'secret'];
  return Object.keys(data).reduce((acc, key) => {
    acc[key] = sensitive.includes(key.toLowerCase()) ? '[REDACTED]' : data[key];
    return acc;
  }, {});
}
```

## Usage Examples

### ✅ **Correct Usage**
```typescript
@Module({
  imports: [
    SecurityModule.forRoot({
      hashing: { rounds: 12, algorithm: 'bcrypt' }
    })
  ],
})
export class AuthModule {}
```

### ❌ **Incorrect Usage**
```typescript
// Don't instantiate directly
const encryption = new EncryptionService();
```

## Testing Strategy

```typescript
describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [SecurityModule.forRoot()],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should hash and verify passwords', async () => {
    const password = 'testPassword123';
    const hashResult = await service.hashPassword(password);
    
    expect(hashResult.isSuccess).toBe(true);
    
    const verifyResult = await service.verifyPassword(password, hashResult.value.hash);
    expect(verifyResult.isSuccess).toBe(true);
    expect(verifyResult.value).toBe(true);
  });
});
```

## Security Checklist

- [ ] All operations return Result<T>
- [ ] No sensitive data in logs
- [ ] Constant-time comparisons
- [ ] Secure random generation
- [ ] Key rotation support
- [ ] Audit trail integration
- [ ] Configuration validation
- [ ] Memory cleanup after operations