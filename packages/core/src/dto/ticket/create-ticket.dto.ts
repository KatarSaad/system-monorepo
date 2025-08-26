import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, MinLength, MaxLength } from 'class-validator';
import { TicketStatus, TicketPriority } from '../../domain/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket title - brief summary of the issue',
    example: 'Login page not responding',
    minLength: 5,
    maxLength: 200,
    type: String
  })
  @IsString()
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the ticket issue or request',
    example: 'Users are unable to login to the application. The login button becomes unresponsive after clicking.',
    minLength: 10,
    maxLength: 5000,
    type: String
  })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  description: string;

  @ApiProperty({
    description: 'Initial status of the ticket',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
    example: TicketStatus.OPEN,
    enumName: 'TicketStatus'
  })
  @IsEnum(TicketStatus, { message: 'Status must be a valid ticket status' })
  @IsOptional()
  status?: TicketStatus = TicketStatus.OPEN;

  @ApiProperty({
    description: 'Priority level indicating urgency and importance',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
    example: TicketPriority.HIGH,
    enumName: 'TicketPriority'
  })
  @IsEnum(TicketPriority, { message: 'Priority must be a valid ticket priority' })
  @IsOptional()
  priority?: TicketPriority = TicketPriority.MEDIUM;

  @ApiProperty({
    description: 'UUID of the user assigned to handle this ticket',
    example: 'clp1234567890abcdef',
    required: false,
    type: String,
    format: 'uuid'
  })
  @IsString({ message: 'Assignee ID must be a string' })
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'UUID of the user who reported/created this ticket',
    example: 'clp0987654321fedcba',
    type: String,
    format: 'uuid'
  })
  @IsString({ message: 'Reporter ID must be a string' })
  reporterId: string;

  @ApiProperty({
    description: 'Array of tags for categorization and filtering',
    example: ['bug', 'frontend', 'authentication', 'urgent'],
    type: [String],
    required: false,
    maxItems: 10
  })
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({
    description: 'Due date for ticket resolution (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
    required: false
  })
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  @IsOptional()
  dueDate?: Date;
}