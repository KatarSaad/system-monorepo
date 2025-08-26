import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../../domain/ticket.entity';

export class TicketResponseDto {
  @ApiProperty({
    description: 'Unique ticket identifier',
    example: 'clp1234567890abcdef',
    type: String,
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Ticket title',
    example: 'Login page not responding',
    type: String
  })
  title: string;

  @ApiProperty({
    description: 'Detailed ticket description',
    example: 'Users are unable to login to the application. The login button becomes unresponsive after clicking.',
    type: String
  })
  description: string;

  @ApiProperty({
    description: 'Current ticket status',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
    enumName: 'TicketStatus'
  })
  status: TicketStatus;

  @ApiProperty({
    description: 'Ticket priority level',
    enum: TicketPriority,
    example: TicketPriority.HIGH,
    enumName: 'TicketPriority'
  })
  priority: TicketPriority;

  @ApiProperty({
    description: 'UUID of assigned user',
    example: 'clp1234567890abcdef',
    type: String,
    format: 'uuid',
    nullable: true
  })
  assigneeId: string | null;

  @ApiProperty({
    description: 'UUID of reporting user',
    example: 'clp0987654321fedcba',
    type: String,
    format: 'uuid'
  })
  reporterId: string;

  @ApiProperty({
    description: 'Ticket categorization tags',
    example: ['bug', 'frontend', 'authentication'],
    type: [String]
  })
  tags: string[];

  @ApiProperty({
    description: 'Ticket due date',
    example: '2024-12-31T23:59:59.000Z',
    type: String,
    format: 'date-time',
    nullable: true
  })
  dueDate: Date | null;

  @ApiProperty({
    description: 'Ticket resolution date',
    example: '2024-11-15T14:30:00.000Z',
    type: String,
    format: 'date-time',
    nullable: true
  })
  resolvedAt: Date | null;

  @ApiProperty({
    description: 'Ticket creation timestamp',
    example: '2024-11-01T09:00:00.000Z',
    type: String,
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-11-15T14:30:00.000Z',
    type: String,
    format: 'date-time'
  })
  updatedAt: Date;
}