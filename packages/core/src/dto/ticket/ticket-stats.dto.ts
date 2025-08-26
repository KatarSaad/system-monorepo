import { ApiProperty } from '@nestjs/swagger';

export class TicketStatsDto {
  @ApiProperty({
    description: 'Total number of tickets',
    example: 150,
    type: Number,
    minimum: 0
  })
  total: number;

  @ApiProperty({
    description: 'Ticket count by status',
    example: {
      OPEN: 45,
      IN_PROGRESS: 30,
      RESOLVED: 60,
      CLOSED: 15,
      REOPENED: 0
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      minimum: 0
    }
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: 'Ticket count by priority',
    example: {
      LOW: 40,
      MEDIUM: 70,
      HIGH: 30,
      CRITICAL: 10
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      minimum: 0
    }
  })
  byPriority: Record<string, number>;
}

export class TicketMetricsDto {
  @ApiProperty({
    description: 'Average resolution time in hours',
    example: 24.5,
    type: Number,
    minimum: 0
  })
  avgResolutionTime: number;

  @ApiProperty({
    description: 'Number of overdue tickets',
    example: 8,
    type: Number,
    minimum: 0
  })
  overdueCount: number;

  @ApiProperty({
    description: 'Tickets created today',
    example: 12,
    type: Number,
    minimum: 0
  })
  createdToday: number;

  @ApiProperty({
    description: 'Tickets resolved today',
    example: 15,
    type: Number,
    minimum: 0
  })
  resolvedToday: number;

  @ApiProperty({
    description: 'Current resolution rate percentage',
    example: 85.5,
    type: Number,
    minimum: 0,
    maximum: 100
  })
  resolutionRate: number;
}