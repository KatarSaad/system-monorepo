import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, UserDto } from './dto';
import { Roles } from './decorators/roles.decorator';
import { ApiResponseDto } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';
import { Role } from '@prisma/client';
import { PrismaService } from '@katarsaad/system-module';

@ApiTags('Admin - User Management')
@Controller('admin/users')
@ApiBearerAuth()
export class AdminAuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
    private metricsService: MetricsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user (Admin)', description: 'Create a new user account as admin' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createUser(@Body() createUserDto: RegisterDto) {
    const result = await this.authService.register(createUserDto);
    
    if (result.isFailure) {
      throw new Error(result.error);
    }

    this.metricsService.incrementCounter('admin_user_create_success', 1);
    return ApiResponseDto.success(result.value.user, 'User created successfully');
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'List all users', description: 'Get paginated list of all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('isActive') isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          version: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return ApiResponseDto.success({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, 'Users retrieved successfully');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get user by ID', description: 'Get specific user details' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        version: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return ApiResponseDto.success(user, 'User retrieved successfully');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user', description: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserDto })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<RegisterDto & { isActive: boolean; isVerified: boolean }>,
  ) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        version: true,
      },
    });

    this.metricsService.incrementCounter('admin_user_update_success', 1);
    return ApiResponseDto.success(user, 'User updated successfully');
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'Permanently delete user account' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    this.metricsService.incrementCounter('admin_user_delete_success', 1);
    return { success: true, message: 'User deleted successfully' };
  }

  @Post(':id/activate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate user', description: 'Activate user account' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    return ApiResponseDto.success(user, 'User activated successfully');
  }

  @Post(':id/deactivate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate user', description: 'Deactivate user account' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    // Invalidate all user sessions
    await this.prisma.session.updateMany({
      where: { userId: id },
      data: { isActive: false },
    });

    return ApiResponseDto.success(user, 'User deactivated successfully');
  }

  @Post(':id/unlock')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Unlock user account', description: 'Remove account lock and reset login attempts' })
  async unlockUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    return ApiResponseDto.success(user, 'User account unlocked successfully');
  }

  @Post(':id/verify')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify user email', description: 'Mark user email as verified' })
  async verifyUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isVerified: true, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
      },
    });

    return ApiResponseDto.success(user, 'User email verified successfully');
  }

  @Get(':id/sessions')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user sessions', description: 'Get all active sessions for user' })
  async getUserSessions(@Param('id', ParseUUIDPipe) id: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: id, isActive: true },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseDto.success(sessions, 'User sessions retrieved successfully');
  }

  @Delete(':id/sessions')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Revoke all user sessions', description: 'Invalidate all active sessions for user' })
  async revokeUserSessions(@Param('id', ParseUUIDPipe) id: string) {
    await this.prisma.session.updateMany({
      where: { userId: id, isActive: true },
      data: { isActive: false },
    });

    return ApiResponseDto.success(null, 'All user sessions revoked successfully');
  }
}