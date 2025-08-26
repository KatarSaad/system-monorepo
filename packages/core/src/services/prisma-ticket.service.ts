import { Injectable } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketEntity, TicketFilter, TicketStats, Result } from '../index';

export interface IPrismaClient {
  ticket: {
    create(args: any): Promise<any>;
    findUnique(args: any): Promise<any>;
    findMany(args: any): Promise<any>;
    update(args: any): Promise<any>;
    delete(args: any): Promise<any>;
    count(args: any): Promise<number>;
    groupBy(args: any): Promise<any>;
  };
}

@Injectable()
export class PrismaTicketService extends TicketService {
  constructor(private readonly prisma: IPrismaClient) {
    super('PrismaTicketService');
  }

  protected async persistTicket(ticket: TicketEntity): Promise<Result<TicketEntity>> {
    try {
      const data = await this.prisma.ticket.create({
        data: {
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assigneeId: ticket.assigneeId,
          reporterId: ticket.reporterId,
          tags: Array.isArray(ticket.tags) ? JSON.stringify(ticket.tags) : ticket.tags,
          dueDate: ticket.dueDate,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          resolvedAt: ticket.resolvedAt
        }
      });
      return Result.ok(this.mapToEntity(data));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  protected async findTicketById(id: string): Promise<Result<TicketEntity | null>> {
    try {
      const data = await this.prisma.ticket.findUnique({ where: { id } });
      return Result.ok(data ? this.mapToEntity(data) : null);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  protected async findTickets(filter?: TicketFilter, pagination?: { page: number; limit: number }): Promise<Result<{ data: TicketEntity[]; total: number }>> {
    try {
      const where = this.buildWhereClause(filter);
      const { page = 1, limit = 10 } = pagination || {};
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.ticket.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.ticket.count({ where })
      ]);

      return Result.ok({ data: data.map((item: any) => this.mapToEntity(item)), total });
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  protected async updateTicket(ticket: TicketEntity): Promise<Result<TicketEntity>> {
    try {
      const data = await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          assigneeId: ticket.assigneeId,
          tags: Array.isArray(ticket.tags) ? JSON.stringify(ticket.tags) : ticket.tags,
          dueDate: ticket.dueDate,
          updatedAt: ticket.updatedAt,
          resolvedAt: ticket.resolvedAt
        }
      });
      return Result.ok(this.mapToEntity(data));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  protected async deleteTicket(id: string): Promise<Result<void>> {
    try {
      await this.prisma.ticket.delete({ where: { id } });
      return Result.ok();
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  protected async getTicketStatistics(filter?: TicketFilter): Promise<Result<TicketStats>> {
    try {
      const where = this.buildWhereClause(filter);
      const [total, statusStats, priorityStats] = await Promise.all([
        this.prisma.ticket.count({ where }),
        this.prisma.ticket.groupBy({ by: ['status'], where, _count: { id: true } }),
        this.prisma.ticket.groupBy({ by: ['priority'], where, _count: { id: true } })
      ]);

      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};

      statusStats.forEach((stat: any) => {
        if (stat._count && stat._count.id !== undefined) {
          byStatus[stat.status] = stat._count.id;
        }
      });

      priorityStats.forEach((stat: any) => {
        if (stat._count && stat._count.id !== undefined) {
          byPriority[stat.priority] = stat._count.id;
        }
      });

      return Result.ok({ total, byStatus, byPriority });
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  protected async searchTickets(query: string, options?: { page?: number; limit?: number }): Promise<Result<{ data: TicketEntity[]; total: number }>> {
    try {
      const { page = 1, limit = 10 } = options || {};
      const skip = (page - 1) * limit;
      const where = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      };

      const [data, total] = await Promise.all([
        this.prisma.ticket.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.ticket.count({ where })
      ]);

      return Result.ok({ data: data.map((item: any) => this.mapToEntity(item)), total });
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  private mapToEntity(data: any): TicketEntity {
    return new TicketEntity({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId,
      reporterId: data.reporterId,
      tags: data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags) : [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      resolvedAt: data.resolvedAt,
      dueDate: data.dueDate
    }, data.id);
  }

  private buildWhereClause(filter?: TicketFilter): any {
    if (!filter) return {};
    const where: any = {};
    if (filter.status?.length) where.status = { in: filter.status };
    if (filter.priority?.length) where.priority = { in: filter.priority };
    if (filter.assigneeId) where.assigneeId = filter.assigneeId;
    if (filter.reporterId) where.reporterId = filter.reporterId;
    if (filter.tags?.length) where.tags = { contains: JSON.stringify(filter.tags) };
    if (filter.dateRange) {
      where.createdAt = { gte: filter.dateRange.from, lte: filter.dateRange.to };
    }
    return where;
  }
}