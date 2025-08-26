import { Injectable, Logger } from '@nestjs/common';
import { BaseDomainService, DomainConfig, Infrastructure } from '@system/infrastructure';
import { Result } from '@system/core';
import { MetricsService } from '@system/monitoring';
import { AuditService } from '@system/audit';
import { Ticket, TicketStatus, TicketPriority, TicketFilter, TicketStats, TicketWorkflow } from '../interfaces/ticket.interface';

@Injectable()
export class TicketService extends BaseDomainService<Ticket> {
  protected readonly config: DomainConfig = {
    modelName: 'ticket', // Can be mapped to any table name
    fieldMapping: {
      // Logical field -> Schema field mapping
      'id': 'id',
      'title': 'title',
      'description': 'description', 
      'status': 'status',
      'priority': 'priority',
      'assigneeId': 'assignee_id', // Maps to snake_case if needed
      'reporterId': 'reporter_id',
      'tags': 'tags',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'resolvedAt': 'resolved_at',
      'dueDate': 'due_date'
    },
    searchFields: ['title', 'description', 'tags'],
    sortableFields: ['createdAt', 'updatedAt', 'priority', 'status'],
    filterableFields: ['status', 'priority', 'assigneeId', 'reporterId']
  };

  private workflows: TicketWorkflow[] = [
    { from: TicketStatus.OPEN, to: TicketStatus.IN_PROGRESS },
    { from: TicketStatus.IN_PROGRESS, to: TicketStatus.RESOLVED },
    { from: TicketStatus.RESOLVED, to: TicketStatus.CLOSED },
    { from: TicketStatus.RESOLVED, to: TicketStatus.REOPENED },
    { from: TicketStatus.REOPENED, to: TicketStatus.IN_PROGRESS }
  ];

  constructor(
    infrastructure: Infrastructure,
    metrics?: MetricsService,
    private readonly auditService?: AuditService
  ) {
    super(infrastructure, metrics);
  }

  // Schema-agnostic ticket operations
  async createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Ticket>> {
    const ticketData = {
      ...data,
      status: TicketStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.create(ticketData);
    
    if (result.isSuccess && this.auditService) {
      await this.auditService.log({
        userId: data.reporterId,
        action: 'CREATE_TICKET',
        resource: 'ticket',
        resourceId: result.value.id,
        newValues: result.value,
        timestamp: new Date()
      });
    }

    return result;
  }

  async assignTicket(ticketId: string, assigneeId: string, assignedBy: string): Promise<Result<Ticket>> {
    const ticketResult = await this.findById(ticketId);
    if (!ticketResult.isSuccess || !ticketResult.value) {
      return Result.fail('Ticket not found');
    }

    const oldValues = ticketResult.value;
    const result = await this.update(ticketId, { 
      assigneeId,
      status: TicketStatus.IN_PROGRESS,
      updatedAt: new Date()
    });

    if (result.isSuccess && this.auditService) {
      await this.auditService.log({
        userId: assignedBy,
        action: 'ASSIGN_TICKET',
        resource: 'ticket',
        resourceId: ticketId,
        oldValues,
        newValues: result.value,
        timestamp: new Date()
      });
    }

    this.metrics?.incrementCounter('tickets_assigned', 1, {
      priority: oldValues.priority.toLowerCase()
    });

    return result;
  }

  async updateStatus(ticketId: string, newStatus: TicketStatus, userId: string): Promise<Result<Ticket>> {
    const ticketResult = await this.findById(ticketId);
    if (!ticketResult.isSuccess || !ticketResult.value) {
      return Result.fail('Ticket not found');
    }

    const ticket = ticketResult.value;
    
    // Validate workflow transition
    const validTransition = this.workflows.find(w => 
      w.from === ticket.status && w.to === newStatus
    );
    
    if (!validTransition) {
      return Result.fail(`Invalid status transition from ${ticket.status} to ${newStatus}`);
    }

    const updateData: Partial<Ticket> = {
      status: newStatus,
      updatedAt: new Date()
    };

    if (newStatus === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    }

    const result = await this.update(ticketId, updateData);

    if (result.isSuccess && this.auditService) {
      await this.auditService.log({
        userId,
        action: 'UPDATE_TICKET_STATUS',
        resource: 'ticket',
        resourceId: ticketId,
        oldValues: { status: ticket.status },
        newValues: { status: newStatus },
        timestamp: new Date()
      });
    }

    // Track resolution time
    if (newStatus === TicketStatus.RESOLVED && result.isSuccess) {
      const resolutionTime = result.value.resolvedAt!.getTime() - ticket.createdAt.getTime();
      this.metrics?.observeHistogram('ticket_resolution_time', resolutionTime, 
        [3600000, 86400000, 604800000], // 1h, 1d, 1w
        'Ticket resolution time',
        { priority: ticket.priority.toLowerCase() }
      );
    }

    return result;
  }

  async filterTickets(filter: TicketFilter, options: { page?: number; limit?: number } = {}): Promise<Result<{ data: Ticket[]; total: number }>> {
    try {
      const { page = 1, limit = 10 } = options;
      const where: any = {};

      if (filter.status?.length) {
        where.status = { in: filter.status };
      }
      if (filter.priority?.length) {
        where.priority = { in: filter.priority };
      }
      if (filter.assigneeId) {
        where.assigneeId = filter.assigneeId;
      }
      if (filter.reporterId) {
        where.reporterId = filter.reporterId;
      }
      if (filter.tags?.length) {
        where.tags = { hasSome: filter.tags };
      }
      if (filter.dateRange) {
        where.createdAt = {
          gte: filter.dateRange.from,
          lte: filter.dateRange.to
        };
      }

      const result = await this.findMany({ where, page, limit });
      
      this.metrics?.incrementCounter('ticket_filters_applied', 1, {
        filter_count: Object.keys(filter).length.toString()
      });

      return Result.ok({
        data: result.value.data,
        total: result.value.total
      });
    } catch (error) {
      return Result.fail(`Filter failed: ${error.message}`);
    }
  }

  async getTicketStats(filter?: TicketFilter): Promise<Result<TicketStats>> {
    try {
      const where: any = {};
      
      if (filter?.dateRange) {
        where.createdAt = {
          gte: filter.dateRange.from,
          lte: filter.dateRange.to
        };
      }

      // Get basic counts
      const [statusStats, priorityStats, resolvedTickets] = await Promise.all([
        this.query().where(where).groupBy(['status']),
        this.query().where(where).groupBy(['priority']),
        this.query().where({ ...where, status: TicketStatus.RESOLVED, resolvedAt: { not: null } })
          .select(['createdAt', 'resolvedAt']).execute()
      ]);

      const byStatus = statusStats.reduce((acc: any, stat: any) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {});

      const byPriority = priorityStats.reduce((acc: any, stat: any) => {
        acc[stat.priority] = stat._count;
        return acc;
      }, {});

      const total = Object.values(byStatus).reduce((sum: number, count: any) => sum + count, 0);

      let averageResolutionTime: number | undefined;
      if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum: number, ticket: any) => {
          return sum + (new Date(ticket.resolvedAt).getTime() - new Date(ticket.createdAt).getTime());
        }, 0);
        averageResolutionTime = totalTime / resolvedTickets.length;
      }

      return Result.ok({
        total,
        byStatus,
        byPriority,
        averageResolutionTime
      });
    } catch (error) {
      return Result.fail(`Stats calculation failed: ${error.message}`);
    }
  }

  async getOverdueTickets(): Promise<Result<Ticket[]>> {
    try {
      const now = new Date();
      const result = await this.query()
        .where({
          dueDate: { lt: now },
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }
        })
        .orderBy({ dueDate: 'asc' })
        .execute();

      return Result.ok(result.map(item => this.mapFieldsFromSchema(item)));
    } catch (error) {
      return Result.fail(`Failed to get overdue tickets: ${error.message}`);
    }
  }

  async bulkUpdateStatus(ticketIds: string[], status: TicketStatus, userId: string): Promise<Result<number>> {
    try {
      const result = await this.infrastructure.repository<Ticket>(this.config.modelName)
        .bulkUpdate(ticketIds, { status, updatedAt: new Date() });

      if (this.auditService) {
        await this.auditService.log({
          userId,
          action: 'BULK_UPDATE_STATUS',
          resource: 'ticket',
          resourceId: ticketIds.join(','),
          newValues: { status, count: result },
          timestamp: new Date()
        });
      }

      this.metrics?.incrementCounter('tickets_bulk_updated', result, {
        status: status.toLowerCase()
      });

      return Result.ok(result);
    } catch (error) {
      return Result.fail(`Bulk update failed: ${error.message}`);
    }
  }

  // Configure for different schemas
  static forSchema(schemaConfig: Partial<DomainConfig>): typeof TicketService {
    class ConfiguredTicketService extends TicketService {
      protected readonly config = { ...super.config, ...schemaConfig };
    }
    return ConfiguredTicketService;
  }
}