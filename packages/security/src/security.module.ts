import { Module, Global, DynamicModule } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { JwtService } from './services/jwt.service';
import { PasswordService } from './services/password.service';
import { RbacGuard } from './guards/rbac.guard';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { IEncryptionService } from './interfaces/encryption.interface';
import { MonitoringModule } from '@katarsaad/monitoring';

export interface SecurityModuleOptions {
  encryption?: {
    algorithm?: 'AES-256-GCM' | 'AES-256-CBC';
    keyDerivation?: 'PBKDF2' | 'scrypt';
  };
  hashing?: {
    rounds?: number;
    algorithm?: 'bcrypt' | 'argon2';
  };
}

@Global()
@Module({})
export class SecurityModule {
  static forRoot(options?: SecurityModuleOptions): DynamicModule {
    return {
      module: SecurityModule,
      imports: [MonitoringModule],
      providers: [
        {
          provide: 'SECURITY_OPTIONS',
          useValue: options || {},
        },
        {
          provide: 'IEncryptionService',
          useClass: EncryptionService,
        },
        EncryptionService,
        JwtService,
        PasswordService,
        RbacGuard,
        SecurityHeadersMiddleware,
      ],
      exports: ['IEncryptionService', EncryptionService, JwtService, PasswordService, RbacGuard, SecurityHeadersMiddleware],
    };
  }
}