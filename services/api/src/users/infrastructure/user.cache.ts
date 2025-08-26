import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CacheService } from '@katarsaad/core';

@Injectable()
export class UserCache {
  constructor(private cache: CacheService) {}

  async cacheUser(user: User, ttl = 3600) {
    await this.cache.set(`user:${user.id}`, user, { ttl, tags: ['user'] });
  }

  async getCachedUser(id: string): Promise<User | null> {
    return (await this.cache.get<User>(`user:${id}`)) as unknown as User | null;
  }

  async invalidateUserCache(id: string) {
    await this.cache.delete(`user:${id}`);
  }

  async invalidateAllUserCache() {
    await this.cache.invalidateByTag('user');
  }

  async cacheUserList(key: string, users: User[], ttl = 1800) {
    await this.cache.set(key, users, { ttl, tags: ['user', 'list'] });
  }

  async getCachedUserList(key: string): Promise<User[] | null> {
    return (await this.cache.get<User[]>(key)) as unknown as User[] | null;
  }
}
