import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, BulkUserOperationDto, UserResponseDto, PaginatedUsersResponseDto, UserStatsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiResponseDto } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';
import { RateLimitGuard } from '@katarsaad/rate-limiting';
import { Logger } from '@nestjs/common';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(RateLimitGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user', description: 'Create a new user account (Admin only)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    this.logger.log(`Create user request: ${createUserDto.email}`);

    const result = await this.usersService.create(createUserDto, req.user);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_user_create_failed', 1);
      throw new BadRequestException(result.error);
    }

    this.metricsService.incrementCounter('api_user_create_success', 1);
    return ApiResponseDto.success(result.value, 'User created successfully');
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve paginated list of users with filtering' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: PaginatedUsersResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async findAll(@Query() query: UserQueryDto) {
    this.logger.log(
      `Get users request: page=${query.page}, limit=${query.limit}`,
    );

    const result = await this.usersService.findAll(query);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_user_list_failed', 1);
      throw new Error(result.error);
    }

    this.metricsService.incrementCounter('api_user_list_success', 1);
    return ApiResponseDto.success(result.value, 'Users retrieved successfully');
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user statistics', description: 'Retrieve user statistics and analytics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: UserStatsDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async getStats() {
    const result = await this.usersService.getUserStats();

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return ApiResponseDto.success(
      result.value,
      'User statistics retrieved successfully',
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve specific user information' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    if (req.user.role === Role.USER && req.user.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    const result = await this.usersService.findOne(id);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_user_get_failed', 1);
      throw new NotFoundException(result.error);
    }

    this.metricsService.incrementCounter('api_user_get_success', 1);
    return ApiResponseDto.success(result.value, 'User retrieved successfully');
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({ summary: 'Update user', description: 'Update user information' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    if (req.user.role === Role.USER) {
      if (req.user.id !== id) {
        throw new ForbiddenException('Access denied');
      }
      delete updateUserDto.role;
      delete updateUserDto.isActive;
      delete updateUserDto.isVerified;
    }

    const result = await this.usersService.update(id, updateUserDto, req.user);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_user_update_failed', 1);
      throw new BadRequestException(result.error);
    }

    this.metricsService.incrementCounter('api_user_update_success', 1);
    return ApiResponseDto.success(result.value, 'User updated successfully');
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'Soft delete user account' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    if (req.user.id === id) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const result = await this.usersService.remove(id, req.user);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_user_delete_failed', 1);
      throw new NotFoundException(result.error);
    }

    this.metricsService.incrementCounter('api_user_delete_success', 1);
    return { success: true, message: 'User deleted successfully' };
  }

  @Post('bulk')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk user operations', description: 'Perform bulk operations on multiple users' })
  @ApiBody({ type: BulkUserOperationDto })
  @ApiResponse({ status: 200, description: 'Bulk operation completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async bulkOperation(@Body() bulkDto: BulkUserOperationDto, @Req() req: any) {
    if (bulkDto.userIds.includes(req.user.id)) {
      throw new BadRequestException(
        'Cannot perform bulk operations on your own account',
      );
    }

    const result = await this.usersService.bulkOperation(bulkDto, req.user);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_user_bulk_failed', 1, {
        operation: bulkDto.operation,
      });
      throw new BadRequestException(result.error);
    }

    this.metricsService.incrementCounter('api_user_bulk_success', 1, {
      operation: bulkDto.operation,
    });
    return ApiResponseDto.success(
      result.value,
      `Bulk ${bulkDto.operation} completed successfully`,
    );
  }

  @Get(':id/profile')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({ summary: 'Get user profile', description: 'Retrieve user profile information' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    if (req.user.role === Role.USER && req.user.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    const result = await this.usersService.findOne(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }

    const user = result.value as any;
    return ApiResponseDto.success(
      user.profile || {},
      'User profile retrieved successfully',
    );
  }
}
