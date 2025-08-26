# Security Services Documentation

## EncryptionService

Enterprise-grade encryption service with AES encryption, password hashing, and secure token generation.

### Features
- **AES Encryption/Decryption** - Secure data encryption with salt and IV
- **Password Hashing** - PBKDF2-like password hashing with scrypt
- **Secure Token Generation** - Cryptographically secure random tokens
- **Hash Functions** - Various hashing algorithms (SHA-256, etc.)
- **Password Verification** - Timing-safe password verification

### Usage

```typescript
import { EncryptionService } from '@system/security';

// Encrypt data
const encrypted = await encryptionService.encrypt('sensitive data', 'password');
if (encrypted.isSuccess) {
  console.log('Encrypted:', encrypted.value);
}

// Decrypt data
const decrypted = await encryptionService.decrypt(encrypted.value, 'password');
if (decrypted.isSuccess) {
  console.log('Decrypted:', decrypted.value);
}

// Hash password
const { hash, salt } = await encryptionService.hashPassword('userPassword');

// Verify password
const isValid = await encryptionService.verifyPassword('userPassword', hash, salt);

// Generate secure token
const token = encryptionService.generateSecureToken(32);
```

### API Reference

#### Encryption Methods
- `encrypt(data: string, password: string, options?: EncryptionOptions): Promise<Result<EncryptedData>>`
- `decrypt(encryptedData: EncryptedData, password: string): Promise<Result<string>>`

#### Hashing Methods
- `hash(data: string, options?: HashOptions): Result<string>`
- `hashPassword(password: string, options?: HashOptions): Promise<Result<{ hash: string; salt: string }>>`
- `verifyPassword(password: string, hash: string, salt: string, keyLength?: number): Promise<Result<boolean>>`

#### Token Generation
- `generateRandomBytes(length: number): Result<string>`
- `generateSecureToken(length?: number): Result<string>`

### Configuration

```typescript
interface EncryptionOptions {
  algorithm?: string;        // Default: 'aes-256-gcm'
  keyLength?: number;        // Default: 32
  ivLength?: number;         // Default: 16
  iterations?: number;       // Default: 100000
  saltLength?: number;       // Default: 32
}
```

### Security Best Practices

1. **Password Storage** - Always use `hashPassword()` for storing user passwords
2. **Token Generation** - Use `generateSecureToken()` for API tokens and session IDs
3. **Data Encryption** - Use strong passwords and store them securely
4. **Salt Usage** - Always use unique salts for password hashing
5. **Timing Attacks** - The service uses timing-safe comparison for password verification

### Example Implementation

```typescript
@Injectable()
export class AuthService {
  constructor(private encryptionService: EncryptionService) {}

  async registerUser(email: string, password: string) {
    // Hash password before storing
    const hashResult = await this.encryptionService.hashPassword(password);
    if (hashResult.isFailure) {
      throw new Error('Password hashing failed');
    }

    const user = {
      email,
      passwordHash: hashResult.value.hash,
      passwordSalt: hashResult.value.salt,
    };

    // Save user to database
    return await this.userRepository.save(user);
  }

  async loginUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValid = await this.encryptionService.verifyPassword(
      password,
      user.passwordHash,
      user.passwordSalt
    );

    if (!isValid.value) {
      throw new Error('Invalid credentials');
    }

    // Generate session token
    const tokenResult = this.encryptionService.generateSecureToken();
    if (tokenResult.isFailure) {
      throw new Error('Token generation failed');
    }

    return { user, token: tokenResult.value };
  }
}