import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ enum: Role, description: 'User role' })
  role: Role;

  @ApiProperty({ description: 'Account active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Email verification status' })
  isVerified: boolean;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Last login date', nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ description: 'Account version for token invalidation' })
  version: number;
}