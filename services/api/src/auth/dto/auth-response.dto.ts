import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDto {
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
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserDto
  })
  user: UserDto;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600
  })
  expiresIn: number;
}