import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@katarsaad/infrastructure';
import { MetricsService } from '@katarsaad/monitoring';
import { CacheService } from '@katarsaad/core';

@Injectable()
export class UserInfraRepository {
  constructor(
    private prisma: PrismaService,
    private metrics: MetricsService,
    private cache: CacheService,
  ) {}

  async findByEmail(email: string): Promise<any> {
    const cacheKey = `user:email:${email}`;
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (user) {
      await this.cache.set(cacheKey, user, { ttl: 300 });
    }
    return user;
  }

  async findActiveUsers(page = 1, limit = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isActive: true },
        include: { profile: true },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where: { isActive: true } })
    ]);

    this.metrics.incrementCounter('user_queries', 1, { type: 'active_users' });
    
    return {
      data, total, page, limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };
  }

  async searchUsers(query: string, page = 1, limit = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const where = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } }
      ]
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit }),
      this.prisma.user.count({ where })
    ]);

    this.metrics.incrementCounter('user_searches', 1);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
  }

  async getUserStats(): Promise<any> {
    const [total, active, byRole] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.groupBy({ by: ['role'], _count: { id: true } })
    ]);
    return { total, active, byRole };
  }

  async bulkUpdateUsers(ids: string[], data: Partial<User>): Promise<any> {
    const result = await this.prisma.user.updateMany({ where: { id: { in: ids } }, data });
    this.metrics.incrementCounter('user_bulk_updates', 1, { count: result.count.toString() });
    return result;
  }

  async create(data: any): Promise<any> {
    const user = await this.prisma.user.create({ data });
    this.metrics.incrementCounter('user_created', 1);
    return user;
  }

  async findById(id: string, options?: any): Promise<any> {
    return await this.prisma.user.findUnique({ where: { id }, ...options });
  }

  async update(id: string, data: Partial<User>): Promise<any> {
    const user = await this.prisma.user.update({ where: { id }, data });
    await this.cache.delete(`user:email:${user.email}`);
    return user;
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }

  async count(where?: any) {
    return await this.prisma.user.count({ where });
  }
}