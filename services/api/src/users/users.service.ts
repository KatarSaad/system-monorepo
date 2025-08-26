import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BaseService, Result } from '@katarsaad/system-module';
import { User, Role, UserProfile } from '@prisma/client';
import { PrismaService } from '@katarsaad/system-module';
import { SystemIntegrationService } from '../system/system.service';
import { AuditService } from '@katarsaad/audit';
import { MetricsService } from '@katarsaad/monitoring';
import { ValidationService } from '@katarsaad/validation';
import { CacheService } from '@katarsaad/core';

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  isActive?: boolean;
  role?: Role;
  isVerified?: boolean;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BulkUserOperationDto {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'verify';
  data?: any;
}

@Injectable()
export class UsersService extends BaseService {
  constructor(
    private systemService: SystemIntegrationService,
    private prisma: PrismaService,
    private auditService: AuditService,
    private metricsService: MetricsService,
    private validationService: ValidationService,
    private cacheService: CacheService,
  ) {
    super('UsersService');
    this.initializeMetrics();
  }

  async create(
    createUserDto: CreateUserDto,
    currentUser?: any,
  ): Promise<Result<User>> {
    try {
      const validation = await this.validateCreateUser(createUserDto);
      if (!validation.value.isValid) {
        return Result.fail(
          `Validation failed: ${validation.value.errors.join(', ')}`,
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        return Result.fail('Email already exists');
      }

      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          passwordHash: 'hashed_password', // Simplified for now
          passwordSalt: 'salt',
          role: createUserDto.role || Role.USER,
          isActive: true,
          isVerified: false,
          version: 1,
        },
      });

      // Audit log
      await this.auditService.log({
        userId: currentUser?.id || 'system',
        action: 'CREATE_USER',
        resource: 'User',
        resourceId: user.id,
        newValues: { email: user.email, name: user.name, role: user.role },
        timestamp: new Date(),
      });

      // Metrics
      this.metricsService.incrementCounter('users_created', 1, {
        role: user.role,
      });

      // Publish event
      await this.systemService.publishEvent('UserCreated', {
        id: user.id,
        email: user.email,
        name: user.name,
      });

      return Result.ok(this.sanitizeUser(user));
    } catch (error) {
      return Result.fail(`User creation failed: ${error}`);
    }
  }

  async findAll(query: UserQueryDto): Promise<Result<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        isActive,
        isVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: { profile: true },
        }),
        this.prisma.user.count({ where }),
      ]);

      const result = {
        data: users.map((user: any) => this.sanitizeUser(user)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      return Result.ok(result);
    } catch (error) {
      return Result.fail(`Failed to fetch users: ${error}`);
    }
  }

  async findOne(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });

      if (!user) {
        return Result.fail('User not found');
      }

      return Result.ok(this.sanitizeUser(user));
    } catch (error) {
      return Result.fail(`Failed to fetch user: ${error}`);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: any,
  ): Promise<Result<User>> {
    try {
      const validation = await this.validateUpdateUser(updateUserDto);
      if (!validation.value.isValid) {
        return Result.fail(
          `Validation failed: ${validation.value.errors.join(', ')}`,
        );
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return Result.fail('User not found');
      }

      if (updateUserDto.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (emailExists && emailExists.id !== id) {
          return Result.fail('Email already exists');
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          version: existingUser.version + 1,
          updatedAt: new Date(),
        },
      });

      // Audit log
      await this.auditService.log({
        userId: currentUser?.id || 'system',
        action: 'UPDATE_USER',
        resource: 'User',
        resourceId: id,
        oldValues: this.sanitizeUser(existingUser),
        newValues: updateUserDto,
        timestamp: new Date(),
      });

      // Metrics
      this.metricsService.incrementCounter('users_updated', 1);

      return Result.ok(this.sanitizeUser(updatedUser));
    } catch (error) {
      return Result.fail(`User update failed: ${error}`);
    }
  }

  async remove(id: string, currentUser?: any): Promise<Result<void>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return Result.fail('User not found');
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          version: user.version + 1,
          updatedAt: new Date(),
        },
      });

      // Audit log
      await this.auditService.log({
        userId: currentUser?.id || 'system',
        action: 'DELETE_USER',
        resource: 'User',
        resourceId: id,
        oldValues: { isActive: user.isActive },
        newValues: { isActive: false },
        timestamp: new Date(),
      });

      // Metrics
      this.metricsService.incrementCounter('users_deleted', 1);

      return Result.ok();
    } catch (error) {
      return Result.fail(`User deletion failed: ${error}`);
    }
  }

  private async validateCreateUser(dto: CreateUserDto) {
    const errors = [];
    if (!dto.email) errors.push('Email is required');
    if (!dto.name) errors.push('Name is required');
    if (!dto.password) errors.push('Password is required');

    return Result.ok({
      isValid: errors.length === 0,
      errors,
    });
  }

  private async validateUpdateUser(dto: UpdateUserDto) {
    const errors = [];
    if (dto.email && !dto.email.includes('@'))
      errors.push('Invalid email format');

    return Result.ok({
      isValid: errors.length === 0,
      errors,
    });
  }

  async bulkOperation(
    bulkDto: BulkUserOperationDto,
    currentUser?: any,
  ): Promise<Result<any>> {
    try {
      const { userIds, operation } = bulkDto;

      if (!userIds || userIds.length === 0) {
        return Result.fail('No user IDs provided');
      }

      let updateData: any = {};
      switch (operation) {
        case 'activate':
          updateData = { isActive: true };
          break;
        case 'deactivate':
          updateData = { isActive: false };
          break;
        case 'verify':
          updateData = { isVerified: true };
          break;
        case 'delete':
          updateData = { isActive: false };
          break;
        default:
          return Result.fail('Invalid operation');
      }

      const result = await this.prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { ...updateData, updatedAt: new Date() },
      });

      return Result.ok({ updated: result.count });
    } catch (error) {
      return Result.fail(`Bulk operation failed: ${error}`);
    }
  }

  async getUserStats(): Promise<Result<any>> {
    try {
      const [total, active, verified, roleStats] = await Promise.all([
        this.prisma.user.count({}),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isVerified: true } }),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        }),
      ]);

      const stats = {
        total,
        active,
        verified,
        byRole: roleStats,
        timestamp: new Date(),
      };

      return Result.ok(stats);
    } catch (error) {
      return Result.fail(`Failed to get user stats: ${error}`);
    }
  }

  private sanitizeUser(user: any): any {
    const { passwordHash, passwordSalt, ...sanitized } = user;
    return sanitized;
  }

  private initializeMetrics(): void {
    this.metricsService.createCounter('users_created', 'Users created');
    this.metricsService.createCounter('users_updated', 'Users updated');
    this.metricsService.createCounter('users_deleted', 'Users deleted');
    this.metricsService.createCounter('users_queries', 'User queries executed');
  }
}
