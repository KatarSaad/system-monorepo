import { Injectable } from '@nestjs/common';
import { PrismaService } from '@katarsaad/infrastructure';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class UserAnalytics {
  constructor(
    private prisma: PrismaService,
    private metrics: MetricsService
  ) {}

  async getUserGrowthMetrics(days = 30): Promise<any> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const result = await this.prisma.user.groupBy({
      by: ['role'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: { id: true }
    });
    
    this.metrics.incrementCounter('analytics_queries', 1, { type: 'growth' });
    return result;
  }

  async getActiveUserStats(): Promise<any> {
    const result = await this.prisma.user.groupBy({
      by: ['role', 'isVerified'],
      where: { isActive: true },
      _count: { id: true }
    });
    
    this.metrics.incrementCounter('analytics_queries', 1, { type: 'active_stats' });
    return result;
  }

  async getUserEngagementMetrics() {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, newUsersThisWeek, verifiedUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      this.prisma.user.count({ where: { isVerified: true } })
    ]);
    
    this.metrics.incrementCounter('analytics_queries', 1, { type: 'engagement' });
    return { totalUsers, activeUsers, newUsersThisWeek, verifiedUsers };
  }
}
