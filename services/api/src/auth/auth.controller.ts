import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto, UserDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { RateLimitGuard } from '@katarsaad/rate-limiting';
import { MetricsService } from '@katarsaad/monitoring';
import { ApiResponseDto } from '@katarsaad/core';
import { Logger } from '@nestjs/common';
import { Role } from '@prisma/client';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private metricsService: MetricsService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user', description: 'Create a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto, @Req() req: any) {
    this.logger.log(`Registration attempt: ${registerDto?.email || 'undefined'}`);

    const result = await this.authService.register(registerDto, req);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_auth_register_failed', 1);
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    this.metricsService.incrementCounter('api_auth_register_success', 1);
    return ApiResponseDto.success(result.value, 'Registration successful');
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user and return tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    this.logger.log(`Login attempt: ${loginDto.email}`);

    const result = await this.authService.login(loginDto, req);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_auth_login_failed', 1);
      throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
    }

    this.metricsService.incrementCounter('api_auth_login_success', 1);
    return ApiResponseDto.success(result.value, 'Login successful');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Generate new access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);


    if (result.isFailure) {
      this.metricsService.incrementCounter('api_auth_refresh_failed', 1);
      throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
    }

    this.metricsService.incrementCounter('api_auth_refresh_success', 1);
    return ApiResponseDto.success(result.value, 'Token refreshed successfully');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout', description: 'Logout user and invalidate current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await this.authService.logout(req.user.id, token);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_auth_logout_failed', 1);
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    this.metricsService.incrementCounter('api_auth_logout_success', 1);
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile', description: 'Retrieve current user profile information' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: any) {
    this.metricsService.incrementCounter('api_auth_profile_access', 1);
    return ApiResponseDto.success(req.user, 'Profile retrieved successfully');
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all sessions', description: 'Logout user from all active sessions' })
  @ApiResponse({ status: 200, description: 'All sessions logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAll(@Req() req: any) {
    const result = await this.authService.logout(req.user.id);

    if (result.isFailure) {
      this.metricsService.incrementCounter('api_auth_logout_all_failed', 1);
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    this.metricsService.incrementCounter('api_auth_logout_all_success', 1);
    return { success: true, message: 'All sessions logged out successfully' };
  }
}
