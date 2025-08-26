import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { 
  TicketService, 
  CreateTicketDto, 
  UpdateTicketDto, 
  TicketResponseDto, 
  TicketFilterDto, 
  TicketStatsDto, 
  PaginationDto, 
  PaginatedResponseDto,
  TicketStatus,
  TicketPriority,
  TicketEntity
} from '@katarsaad/core';

@Controller('tickets')
@ApiTags('Tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create new ticket',
    description: 'Creates a new support ticket with detailed information and validation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ticket created successfully',
    type: TicketResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createTicket(@Body() data: CreateTicketDto): Promise<TicketResponseDto> {
    const createData = {
      ...data,
      priority: data.priority || TicketPriority.MEDIUM,
      status: data.status || TicketStatus.OPEN
    };
    
    const result = await this.ticketService.createTicket(createData);
    
    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return this.mapToResponseDto(result.value);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get ticket by ID',
    description: 'Retrieves a specific ticket by its unique identifier'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket found',
    type: TicketResponseDto
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTicket(@Param('id') id: string): Promise<TicketResponseDto> {
    const result = await this.ticketService.getTicket(id);
    
    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    
    if (!result.value) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }
    
    return this.mapToResponseDto(result.value);
  }

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign ticket' })
  async assignTicket(
    @Param('id') id: string,
    @Body() data: { assigneeId: string; assignedBy: string }
  ) {
    const result = await this.ticketService.assignTicket(id, data.assigneeId, data.assignedBy);
    
    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return this.mapToResponseDto(result.value);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() data: { status: TicketStatus; userId: string }
  ) {
    const result = await this.ticketService.updateTicketStatus(id, data.status, data.userId);
    
    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    
    return this.mapToResponseDto(result.value);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get filtered tickets with pagination',
    description: 'Retrieves tickets with advanced filtering, sorting, and pagination capabilities'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tickets retrieved successfully',
    type: PaginatedResponseDto<TicketResponseDto>
  })
  @ApiResponse({ status: 400, description: 'Invalid filter parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTickets(
    @Query() filters: TicketFilterDto,
    @Query() pagination: PaginationDto
  ): Promise<PaginatedResponseDto<TicketResponseDto>> {
    const filter = {
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assigneeId,
      reporterId: filters.reporterId,
      tags: filters.tags,
      dateRange: filters.dateFrom && filters.dateTo ? {
        from: new Date(filters.dateFrom),
        to: new Date(filters.dateTo)
      } : undefined
    };
    
    const result = await this.ticketService.filterTickets(filter, { 
      page: pagination.page || 1, 
      limit: pagination.limit || 10 
    });
    
    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const { data, total } = result.value;
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: data.map(ticket => this.mapToResponseDto(ticket)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Get comprehensive ticket statistics',
    description: 'Retrieves detailed analytics including counts by status, priority, and performance metrics'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully',
    type: TicketStatsDto
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStats(): Promise<TicketStatsDto> {
    const result = await this.ticketService.getTicketStats();
    
    if (!result.isSuccess) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    return result.value;
  }

  private mapToResponseDto(entity: TicketEntity): TicketResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      assigneeId: entity.assigneeId || null,
      reporterId: entity.reporterId,
      tags: entity.tags || [],
      dueDate: entity.dueDate || null,
      resolvedAt: entity.resolvedAt || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}