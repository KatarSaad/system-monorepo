import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { TicketStatus, TicketPriority } from '../../domain/ticket.entity';

export class UpdateTicketDto {
  @ApiProperty({
    description: 'Updated ticket title',
    example: 'Login page fixed - testing required',
    minLength: 5,
    maxLength: 200,
    required: false,
    type: String
  })
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Updated detailed description',
    example: 'Issue has been resolved. Login functionality restored. Requires QA testing.',
    minLength: 10,
    maxLength: 5000,
    required: false,
    type: String
  })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Updated ticket status',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
    required: false,
    enumName: 'TicketStatus'
  })
  @IsEnum(TicketStatus, { message: 'Status must be a valid ticket status' })
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    description: 'Updated priority level',
    enum: TicketPriority,
    example: TicketPriority.LOW,
    required: false,
    enumName: 'TicketPriority'
  })
  @IsEnum(TicketPriority, { message: 'Priority must be a valid ticket priority' })
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({
    description: 'Updated assignee UUID',
    example: 'clp1234567890abcdef',
    required: false,
    type: String,
    format: 'uuid'
  })
  @IsUUID(4, { message: 'Assignee ID must be a valid UUID' })
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'Updated tags array',
    example: ['bug', 'resolved', 'testing-required'],
    type: [String],
    required: false,
    maxItems: 10
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Updated due date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
    required: false
  })
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  @IsOptional()
  dueDate?: Date;
}