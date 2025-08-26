import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserInfraRepository } from './infrastructure/user.repository';
import { UserAnalytics } from './infrastructure/user.analytics';
import { UserCache } from './infrastructure/user.cache';

import { SystemModule } from '@katarsaad/system-module';
import { SystemIntegrationModule } from '../system/system.module';
import { AuditModule } from '@katarsaad/audit';
import { MonitoringModule } from '@katarsaad/monitoring';
import { ValidationModule } from '@katarsaad/validation';
import { CoreModule } from '@katarsaad/core';

// Import auth dependencies
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
    SystemModule,
    SystemIntegrationModule,
    AuditModule,
    MonitoringModule,
    ValidationModule,
    CoreModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserInfraRepository,
    UserAnalytics,
    UserCache,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [UsersService, UserInfraRepository, UserAnalytics, UserCache],
})
export class UsersModule {}
