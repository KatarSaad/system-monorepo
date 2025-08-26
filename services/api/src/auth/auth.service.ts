import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncryptionService } from '@katarsaad/security';
import { CacheService, EventBusService, Result } from '@katarsaad/core';
import { AdvancedValidationService } from '@katarsaad/validation';
import { MetricsService } from '@katarsaad/monitoring';
import { AuditService } from '@katarsaad/audit';
import { RateLimiterService } from '@katarsaad/rate-limiting';
import { PrismaService } from '@katarsaad/system-module';
import { User, Role, Session } from '@prisma/client';
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: Role;
  rememberMe?: boolean;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash' | 'passwordSalt'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private cacheService: CacheService,
    private eventBus: EventBusService,
    private validationService: AdvancedValidationService,
    private metricsService: MetricsService,
    private auditService: AuditService,
    private rateLimiterService: RateLimiterService,
  ) {
    this.initializeMetrics();
  }

  async register(
    registerDto: RegisterDto,
    req?: any,
  ): Promise<Result<AuthResult>> {
    try {
      const validation = await this.validateRegistration(registerDto);
      if (!validation.value.isValid) {
        this.metricsService.incrementCounter('auth_register_failed', 1, {
          reason: 'validation',
        });
        return Result.fail(
          `Validation failed: ${validation.value.errors.join(', ')}`,
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        this.metricsService.incrementCounter('auth_register_failed', 1, {
          reason: 'email_exists',
        });
        return Result.fail('Email already registered');
      }

      const hashResult = await this.encryptionService.hashPassword(
        registerDto.password,
      );
      if (hashResult.isFailure) {
        return Result.fail('Password hashing failed');
      }

      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          passwordHash: hashResult.value.hash,
          passwordSalt: hashResult.value.salt,
          role: registerDto.role || Role.USER,
          isActive: true,
          isVerified: false,
          version: 1,
          loginAttempts: 0,
        },
      });

      const tokens = await this.generateTokens(user, registerDto.rememberMe);
      if (tokens.isFailure) {
        return Result.fail('Token generation failed');
      }

      await this.createSession(user.id, tokens.value as any, req);

      await this.auditService.log({
        action: 'USER_REGISTERED',
        resource: 'user',
        resourceId: user.id,
        userId: user.id,
        metadata: { email: user.email, role: user.role },
        ipAddress: req?.ip,
        userAgent: req?.headers?.['user-agent'],
        timestamp: new Date(),
      });

      this.eventBus.publish({
        id: `user-registered-${Date.now()}`,
        type: 'user.registered',
        aggregateId: user.id,
        aggregateType: 'User',
        version: 1,
        occurredOn: new Date(),
        data: {
          userId: user.id,
          email: user.email,
        },
      });

      this.metricsService.incrementCounter('auth_register_success', 1);

      const tokenData = tokens.value as any;
      return Result.ok({
        user: this.sanitizeUser(user),
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
      });
    } catch (error) {
      this.metricsService.incrementCounter('auth_register_failed', 1, {
        reason: 'error',
      });
      return Result.fail(`Registration failed: ${error}`);
    }
  }

  async login(loginDto: LoginDto, req?: any): Promise<Result<AuthResult>> {
    try {
      const validation = await this.validateLogin(loginDto);
      if (!validation.value.isValid) {
        return Result.fail(
          `Validation failed: ${validation.value.errors.join(', ')}`,
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        this.metricsService.incrementCounter('auth_login_failed', 1, {
          reason: 'user_not_found',
        });
        return Result.fail('Invalid credentials');
      }

      if (!user.isActive) {
        this.metricsService.incrementCounter('auth_login_failed', 1, {
          reason: 'account_deactivated',
        });
        return Result.fail('Account is deactivated');
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        this.metricsService.incrementCounter('auth_login_failed', 1, {
          reason: 'account_locked',
        });
        return Result.fail('Account is temporarily locked');
      }

      const passwordValid = await this.encryptionService.verifyPassword(
        loginDto.password,
        user.passwordHash,
        user.passwordSalt,
      );

      if (!passwordValid.value) {
        await this.handleFailedLogin(user);
        this.metricsService.incrementCounter('auth_login_failed', 1, {
          reason: 'invalid_password',
        });
        return Result.fail('Invalid credentials');
      }

      await this.handleSuccessfulLogin(user);

      const tokens = await this.generateTokens(user, loginDto.rememberMe);
      if (tokens.isFailure) {
        return Result.fail('Token generation failed');
      }

      await this.createSession(user.id, tokens.value as any, req);

      await this.auditService.log({
        action: 'USER_LOGIN',
        resource: 'user',
        resourceId: user.id,
        userId: user.id,
        metadata: { email: user.email },
        ipAddress: req?.ip,
        userAgent: req?.headers?.['user-agent'],
        timestamp: new Date(),
      });

      this.eventBus.publish({
        id: `user-login-${Date.now()}`,
        type: 'user.login',
        aggregateId: user.id,
        aggregateType: 'User',
        version: 1,
        occurredOn: new Date(),
        data: {
          userId: user.id,
          email: user.email,
        },
      });

      this.metricsService.incrementCounter('auth_login_success', 1);

      const tokenData = tokens.value as any;
      return Result.ok({
        user: this.sanitizeUser(user),
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
      });
    } catch (error) {
      this.metricsService.incrementCounter('auth_login_failed', 1, {
        reason: 'error',
      });
      return Result.fail(`Login failed: ${error}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<Result<AuthResult>> {
    try {
      const session = await this.prisma.session.findUnique({
        where: {
          refreshToken,
          isActive: true,
        },
        include: { user: true },
      });

      if (
        !session ||
        new Date() > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ) {
        this.metricsService.incrementCounter('auth_refresh_failed', 1, {
          reason: 'invalid_token',
        });
        return Result.fail('Invalid or expired refresh token');
      }

      if (!session.user.isActive) {
        this.metricsService.incrementCounter('auth_refresh_failed', 1, {
          reason: 'user_inactive',
        });
        return Result.fail('User account is deactivated');
      }

      const tokens = await this.generateTokens(session.user, false);
      if (tokens.isFailure) {
        return Result.fail('Token generation failed');
      }

      const tokenData = tokens.value as any;
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
        },
      });

      this.metricsService.incrementCounter('auth_refresh_success', 1);

      return Result.ok({
        user: this.sanitizeUser(session.user),
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: tokenData.expiresIn,
      });
    } catch (error) {
      this.metricsService.incrementCounter('auth_refresh_failed', 1);
      return Result.fail(`Token refresh failed: ${error}`);
    }
  }

  async logout(userId: string, accessToken?: string): Promise<Result<void>> {
    try {
      if (accessToken) {
        await this.prisma.session.updateMany({
          where: {
            userId,
            accessToken,
            isActive: true,
          },
          data: { isActive: false },
        });
      } else {
        await this.prisma.session.updateMany({
          where: {
            userId,
            isActive: true,
          },
          data: { isActive: false },
        });
      }

      await this.auditService.log({
        action: 'USER_LOGOUT',
        resource: 'user',
        resourceId: userId,
        userId,
        metadata: { logoutType: accessToken ? 'single' : 'all' },
        timestamp: new Date(),
      });

      this.eventBus.publish({
        id: `user-logout-${Date.now()}`,
        type: 'user.logout',
        aggregateId: userId,
        aggregateType: 'User',
        version: 1,
        occurredOn: new Date(),
        data: {
          userId,
        },
      });

      this.metricsService.incrementCounter('auth_logout', 1);
      return Result.ok();
    } catch (error) {
      return Result.fail(`Logout failed: ${error}`);
    }
  }

  private async generateTokens(user: User, rememberMe = false) {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        version: user.version,
        iat: Math.floor(Date.now() / 1000),
      };

      const expiresIn = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '24h',
      });

      const refreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { expiresIn: '7d' },
      );

      return Result.ok({
        accessToken,
        refreshToken,
        expiresIn,
      });
    } catch (error) {
      return Result.fail(`Token generation failed: ${error}`);
    }
  }

  private async createSession(userId: string, tokens: any, req?: any) {
    const session = await this.prisma.session.create({
      data: {
        userId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        ipAddress: req?.ip || 'unknown',
        userAgent: req?.headers?.['user-agent'] || 'unknown',
        isActive: true,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      },
    });

    await this.cacheService.set(
      `session:${tokens.accessToken}`,
      { userId, sessionId: session.id },
      { ttl: tokens.expiresIn },
    );

    return session;
  }

  private async handleFailedLogin(user: User) {
    const attempts = user.loginAttempts + 1;
    const lockUntil =
      attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: attempts,
        lockedUntil: lockUntil,
      },
    });
  }

  private async handleSuccessfulLogin(user: User) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  private async validateRegistration(dto: RegisterDto) {
    return this.validationService.validateObject(
      dto,
      {
        email: ['required', 'email'],
        password: ['required', 'string', 'minLength'],
        name: ['required', 'string', 'minLength'],
        role: ['string'],
      },
      { context: { minLength: 2 } },
    );
  }

  private async validateLogin(dto: LoginDto) {
    return this.validationService.validateObject(dto, {
      email: ['required', 'email'],
      password: ['required', 'string'],
    });
  }

  private sanitizeUser(
    user: User,
  ): Omit<User, 'passwordHash' | 'passwordSalt'> {
    const { passwordHash, passwordSalt, ...sanitized } = user;
    return sanitized;
  }

  private initializeMetrics() {
    this.metricsService.createCounter(
      'auth_register_success',
      'Successful registrations',
    );
    this.metricsService.createCounter(
      'auth_register_failed',
      'Failed registrations',
    );
    this.metricsService.createCounter(
      'auth_login_success',
      'Successful logins',
    );
    this.metricsService.createCounter('auth_login_failed', 'Failed logins');
    this.metricsService.createCounter(
      'auth_refresh_success',
      'Successful token refreshes',
    );
    this.metricsService.createCounter(
      'auth_refresh_failed',
      'Failed token refreshes',
    );
    this.metricsService.createCounter('auth_logout', 'User logouts');
  }
}
