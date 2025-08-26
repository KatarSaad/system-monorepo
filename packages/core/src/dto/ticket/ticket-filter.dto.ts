import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsDateString, IsUUID, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TicketStatus, TicketPriority } from '../../domain/ticket.entity';

export class TicketFilterDto {
  @ApiProperty({
    description: 'Filter by ticket status(es)',
    enum: TicketStatus,
    isArray: true,
    example: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
    required: false,
    enumName: 'TicketStatus'
  })
  @IsArray({ message: 'Status must be an array' })
  @IsEnum(TicketStatus, { each: true, message: 'Each status must be a valid ticket status' })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  status?: TicketStatus[];

  @ApiProperty({
    description: 'Filter by priority level(s)',
    enum: TicketPriority,
    isArray: true,
    example: [TicketPriority.HIGH, TicketPriority.CRITICAL],
    required: false,
    enumName: 'TicketPriority'
  })
  @IsArray({ message: 'Priority must be an array' })
  @IsEnum(TicketPriority, { each: true, message: 'Each priority must be a valid ticket priority' })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  priority?: TicketPriority[];

  @ApiProperty({
    description: 'Filter by assignee UUID',
    example: 'clp1234567890abcdef',
    required: false,
    type: String,
    format: 'uuid'
  })
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'Filter by reporter UUID',
    example: 'clp0987654321fedcba',
    required: false,
    type: String,
    format: 'uuid'
  })
  @IsUUID(4, { message: 'Reporter ID must be a valid UUID' })
  @IsOptional()
  reporterId?: string;

  @ApiProperty({
    description: 'Filter by tags (tickets containing any of these tags)',
    example: ['bug', 'frontend', 'urgent'],
    type: [String],
    required: false,
    maxItems: 10
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  tags?: string[];

  @ApiProperty({
    description: 'Filter by creation date range - start date (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
    required: false
  })
  @IsDateString({}, { message: 'Date from must be a valid ISO 8601 date string' })
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({
    description: 'Filter by creation date range - end date (ISO 8601)',
    example: '2024-12-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
    required: false
  })
  @IsDateString({}, { message: 'Date to must be a valid ISO 8601 date string' })
  @IsOptional()
  dateTo?: string;

  @ApiProperty({
    description: 'Search query for title and description',
    example: 'login issue',
    required: false,
    type: String,
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsOptional()
  search?: string;
}