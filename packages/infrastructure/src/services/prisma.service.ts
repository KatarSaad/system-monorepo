import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { Result } from '@katarsaad/core';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  constructor() {
    super({
      log: ['error', 'warn'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.isConnected = false;
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', error);
    }
  }

  async executeTransaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<Result<T>> {
    try {
      const result = await this.$transaction(fn);
      return Result.ok(result);
    } catch (error) {
      this.logger.error('Transaction failed', error);
      return Result.fail(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async healthCheck(): Promise<Result<boolean>> {
    try {
      await this.$queryRaw`SELECT 1`;
      return Result.ok(true);
    } catch (error) {
      this.logger.error('Health check failed', error);
      return Result.fail(`Health check failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async softDelete<T extends Record<string, any>>(model: string, id: string): Promise<Result<T | null>> {
    try {
      const modelDelegate = (this as any)[model];
      if (!modelDelegate?.update) {
        return Result.fail(`Model ${model} does not support soft delete`);
      }
      
      const result = await modelDelegate.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      
      return Result.ok(result);
    } catch (error) {
      this.logger.error(`Soft delete failed for ${model}:`, error);
      return Result.fail(`Soft delete failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}