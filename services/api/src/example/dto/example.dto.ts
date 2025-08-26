import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional, IsArray, MinLength, Min } from 'class-validator';

export class CreateExampleDto {
  @ApiProperty({ description: 'User name', example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User age', example: 30, minimum: 1 })
  @IsNumber()
  @Min(1)
  age: number;

  @ApiProperty({ description: 'User password', example: 'SecurePass123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'User tags', example: ['developer', 'nodejs'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateExampleDto {
  @ApiPropertyOptional({ description: 'User name', example: 'Jane Doe', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ description: 'User email', example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'User age', example: 25, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  age?: number;

  @ApiPropertyOptional({ description: 'User tags', example: ['designer', 'react'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SearchExampleDto {
  @ApiProperty({ description: 'Search query', example: 'john' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Search filters' })
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class ExampleResponseDto {
  @ApiProperty({ description: 'Example ID', example: 'example_1234567890_abc123' })
  id: string;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'User age', example: 30 })
  age: number;

  @ApiProperty({ description: 'User tags', example: ['developer', 'nodejs'] })
  tags: string[];

  @ApiProperty({ description: 'Creation date', example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}