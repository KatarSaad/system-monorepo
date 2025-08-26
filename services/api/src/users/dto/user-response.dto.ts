import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserProfileDto {
  @ApiProperty({
    description: 'Profile unique identifier',
    example: 'cuid123456789'
  })
  id: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    nullable: true
  })
  firstName: string | null;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    nullable: true
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true
  })
  avatar: string | null;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    nullable: true
  })
  bio: string | null;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    nullable: true
  })
  phone: string | null;

  @ApiProperty({
    description: 'User timezone',
    example: 'UTC',
    nullable: true
  })
  timezone: string | null;

  @ApiProperty({
    description: 'Preferred language',
    example: 'en'
  })
  language: string;

  @ApiProperty({
    description: 'User preferences',
    example: { theme: 'dark', notifications: true },
    nullable: true
  })
  preferences: any;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'cuid123456789'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.USER
  })
  role: Role;

  @ApiProperty({
    description: 'User account status',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User verification status',
    example: false
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: 'Failed login attempts count',
    example: 0
  })
  loginAttempts: number;

  @ApiProperty({
    description: 'Account locked until timestamp',
    example: null,
    nullable: true
  })
  lockedUntil: Date | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileDto,
    nullable: true
  })
  profile?: UserProfileDto;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto]
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  totalPages: number;

  @ApiProperty({
    description: 'Has next page',
    example: true
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Has previous page',
    example: false
  })
  hasPrev: boolean;
}

export class UserStatsDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 85
  })
  active: number;

  @ApiProperty({
    description: 'Number of verified users',
    example: 70
  })
  verified: number;

  @ApiProperty({
    description: 'User count by role',
    example: [
      { role: 'USER', _count: { id: 80 } },
      { role: 'ADMIN', _count: { id: 5 } }
    ]
  })
  byRole: Array<{ role: string; _count: { id: number } }>;

  @ApiProperty({
    description: 'Statistics timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  timestamp: Date;
}