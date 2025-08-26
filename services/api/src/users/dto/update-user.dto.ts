import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User account status',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.USER,
    required: false
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'User verification status',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}