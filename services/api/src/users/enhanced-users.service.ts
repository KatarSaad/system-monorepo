import { Injectable } from '@nestjs/common';
import { UserInfraRepository } from './infrastructure/user.repository';
import { UserAnalytics } from './infrastructure/user.analytics';
import { UserCache } from './infrastructure/user.cache';
import { User } from '@prisma/client';

@Injectable()
export class EnhancedUsersService {
  constructor(
    private userRepo: UserInfraRepository,
    private userAnalytics: UserAnalytics,
    private userCache: UserCache,
  ) {}

  async findUserWithCache(id: string): Promise<User | null> {
    // Try cache first
    let user = await this.userCache.getCachedUser(id);
    
    if (!user) {
      // Fallback to database
      user = await this.userRepo.findById(id, { include: { profile: true } });
      if (user) {
        await this.userCache.cacheUser(user);
      }
    }
    
    return user;
  }

  async searchUsersAdvanced(query: string, page = 1, limit = 10) {
    const cacheKey = `search:${query}:${page}:${limit}`;
    
    // Try cache first
    let result = await this.userCache.getCachedUserList(cacheKey);
    
    if (!result) {
      const searchResult = await this.userRepo.searchUsers(query, page, limit);
      result = searchResult.data;
      if (result && Array.isArray(result)) {
        await this.userCache.cacheUserList(cacheKey, result, 900); // 15 min cache
      }
    }
    
    return result;
  }

  async getUserDashboardStats() {
    return await this.userAnalytics.getUserEngagementMetrics();
  }

  async getUserGrowthReport(days = 30): Promise<any> {
    return await this.userAnalytics.getUserGrowthMetrics(days);
  }

  async bulkActivateUsers(userIds: string[]): Promise<any> {
    const result = await this.userRepo.bulkUpdateUsers(userIds, { isActive: true });
    
    // Invalidate cache for affected users
    await Promise.all(userIds.map(id => this.userCache.invalidateUserCache(id)));
    
    return result;
  }

  async bulkDeactivateUsers(userIds: string[]): Promise<any> {
    const result = await this.userRepo.bulkUpdateUsers(userIds, { isActive: false });
    
    // Invalidate cache for affected users
    await Promise.all(userIds.map(id => this.userCache.invalidateUserCache(id)));
    
    return result;
  }

  async getActiveUsersWithPagination(page = 1, limit = 10): Promise<any> {
    return await this.userRepo.findActiveUsers(page, limit);
  }

  async getUserStatistics(): Promise<any> {
    return await this.userRepo.getUserStats();
  }
}