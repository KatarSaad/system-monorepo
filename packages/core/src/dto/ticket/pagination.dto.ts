import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number
  })
  @Type(() => Number)
  @IsPositive({ message: 'Page must be a positive number' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    type: Number
  })
  @Type(() => Number)
  @IsPositive({ message: 'Limit must be a positive number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @IsOptional()
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of data items',
    type: 'array'
  })
  data: T[];

  @ApiProperty({
    description: 'Total number of items',
    example: 150,
    type: Number,
    minimum: 0
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
    type: Number,
    minimum: 1
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    type: Number,
    minimum: 1
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
    type: Number,
    minimum: 1
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
    type: Boolean
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
    type: Boolean
  })
  hasPrev: boolean;
}