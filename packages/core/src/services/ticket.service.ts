import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { Result } from '../common/result';
import { TicketEntity, TicketStatus, TicketPriority, TicketProps } from '../domain/ticket.entity';

export interface TicketFilter {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
  dateRange?: { from: Date; to: Date };
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  averageResolutionTime?: number;
  slaCompliance?: number;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: TicketPriority;
  reporterId: string;
  tags?: string[];
  dueDate?: Date;
}

@Injectable()
export abstract class TicketService extends BaseService {
  // Abstract methods to be implemented by infrastructure layer
  protected abstract persistTicket(ticket: TicketEntity): Promise<Result<TicketEntity>>;
  protected abstract findTicketById(id: string): Promise<Result<TicketEntity | null>>;
  protected abstract findTickets(filter?: TicketFilter, pagination?: { page: number; limit: number }): Promise<Result<{ data: TicketEntity[]; total: number }>>;
  protected abstract updateTicket(ticket: TicketEntity): Promise<Result<TicketEntity>>;
  protected abstract deleteTicket(id: string): Promise<Result<void>>;
  protected abstract getTicketStatistics(filter?: TicketFilter): Promise<Result<TicketStats>>;
  protected abstract searchTickets(query: string, options?: { page?: number; limit?: number }): Promise<Result<{ data: TicketEntity[]; total: number }>>;

  async createTicket(data: CreateTicketData): Promise<Result<TicketEntity>> {
    try {
      const ticket = TicketEntity.create({
        title: data.title,
        description: data.description,
        priority: data.priority,
        reporterId: data.reporterId,
        tags: data.tags || [],
        dueDate: data.dueDate
      });

      const result = await this.persistTicket(ticket);
      
      if (result.isSuccess) {
        console.log(`Ticket created: ${ticket.id}`);
      }

      return result;
    } catch (error: any) {
      this.logger.error('Failed to create ticket:', error);
      return Result.fail(`Failed to create ticket: ${error.message}`);
    }
  }

  async getTicket(id: string): Promise<Result<TicketEntity | null>> {
    try {
      return await this.findTicketById(id);
    } catch (error: any) {
      this.logger.error(`Failed to get ticket ${id}:`, error);
      return Result.fail(`Failed to get ticket: ${error.message}`);
    }
  }

  async assignTicket(ticketId: string, assigneeId: string, assignedBy: string): Promise<Result<TicketEntity>> {
    try {
      const ticketResult = await this.findTicketById(ticketId);
      
      if (!ticketResult.isSuccess || !ticketResult.value) {
        return Result.fail('Ticket not found');
      }

      const ticket = ticketResult.value;
      ticket.assign(assigneeId);

      const result = await this.updateTicket(ticket);
      
      if (result.isSuccess) {
        console.log(`Ticket ${ticketId} assigned to ${assigneeId} by ${assignedBy}`);
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Failed to assign ticket ${ticketId}:`, error);
      return Result.fail(`Failed to assign ticket: ${error.message}`);
    }
  }

  async updateTicketStatus(ticketId: string, newStatus: TicketStatus, userId: string): Promise<Result<TicketEntity>> {
    try {
      const ticketResult = await this.findTicketById(ticketId);
      
      if (!ticketResult.isSuccess || !ticketResult.value) {
        return Result.fail('Ticket not found');
      }

      const ticket = ticketResult.value;
      
      if (!ticket.canTransitionTo(newStatus)) {
        return Result.fail(`Invalid status transition from ${ticket.status} to ${newStatus}`);
      }

      ticket.updateStatus(newStatus);

      const result = await this.updateTicket(ticket);
      
      if (result.isSuccess) {
        console.log(`Ticket ${ticketId} status updated to ${newStatus} by ${userId}`);
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Failed to update ticket status ${ticketId}:`, error);
      return Result.fail(`Failed to update ticket status: ${error.message}`);
    }
  }

  async filterTickets(filter: TicketFilter, options: { page?: number; limit?: number } = {}): Promise<Result<{ data: TicketEntity[]; total: number }>> {
    try {
      return await this.findTickets(filter, { page: options.page || 1, limit: options.limit || 10 });
    } catch (error: any) {
      this.logger.error('Failed to filter tickets:', error);
      return Result.fail(`Failed to filter tickets: ${error.message}`);
    }
  }

  async getOverdueTickets(): Promise<Result<TicketEntity[]>> {
    try {
      const result = await this.findTickets({
        status: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.REOPENED]
      });

      if (!result.isSuccess) {
        return Result.fail(result.error);
      }

      const overdueTickets = result.value.data.filter(ticket => ticket.isOverdue());
      
      return Result.ok(overdueTickets);
    } catch (error: any) {
      this.logger.error('Failed to get overdue tickets:', error);
      return Result.fail(`Failed to get overdue tickets: ${error.message}`);
    }
  }

  async getTicketStats(filter?: TicketFilter): Promise<Result<TicketStats>> {
    try {
      return await this.getTicketStatistics(filter);
    } catch (error: any) {
      this.logger.error('Failed to get ticket stats:', error);
      return Result.fail(`Failed to get ticket stats: ${error.message}`);
    }
  }

  async search(query: string, options: { page?: number; limit?: number } = {}): Promise<Result<{ data: TicketEntity[]; total: number }>> {
    try {
      return await this.searchTickets(query, options);
    } catch (error: any) {
      this.logger.error('Failed to search tickets:', error);
      return Result.fail(`Failed to search tickets: ${error.message}`);
    }
  }
}