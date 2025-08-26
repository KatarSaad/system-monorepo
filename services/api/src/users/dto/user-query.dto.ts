import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Search term for name or email',
    example: 'john',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by user role',
    enum: Role,
    example: Role.USER,
    required: false
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter by verification status',
    example: true,
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'name', 'email'],
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}