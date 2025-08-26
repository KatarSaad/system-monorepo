import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SystemModule } from '@katarsaad/system-module';
import { SecurityModule } from '@katarsaad/security';
import { CoreModule } from '@katarsaad/core';
import { ValidationModule } from '@katarsaad/validation';
import { MonitoringModule } from '@katarsaad/monitoring';
import { AuditModule } from '@katarsaad/audit';
import { RateLimitingModule } from '@katarsaad/rate-limiting';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
          issuer: configService.get<string>('JWT_ISSUER') || 'system-api',
          audience: configService.get<string>('JWT_AUDIENCE') || 'system-users',
        },
      }),
      inject: [ConfigService],
    }),
    SystemModule,
    SecurityModule,
    CoreModule,
    ValidationModule,
    MonitoringModule,
    AuditModule,
    RateLimitingModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
