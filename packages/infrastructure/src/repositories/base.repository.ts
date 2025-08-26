import { PrismaClient } from '@prisma/client';
import { 
  IBaseRepository, 
  IFilterOptions, 
  IPaginationOptions, 
  IPaginatedResult, 
  ISearchOptions, 
  IStatsOptions 
} from '../interfaces/repository.interface';
import { DatabaseException, NotFoundExceptionInfra } from '../exceptions/infrastructure.exceptions';

export abstract class BaseRepository<T, ID = string> implements IBaseRepository<T, ID> {
  protected abstract modelName: string;
  
  constructor(protected prisma: PrismaClient) {}

  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create({ data });
    } catch (error) {
      throw new DatabaseException(`Failed to create ${this.modelName}`, error);
    }
  }

  async findById(id: ID, options?: IFilterOptions): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        ...options
      });
    } catch (error) {
      throw new DatabaseException(`Failed to find ${this.modelName} by id`, error);
    }
  }

  async findMany(options?: IFilterOptions & IPaginationOptions): Promise<IPaginatedResult<T>> {
    try {
      const { page = 1, limit = 10, ...filterOptions } = options || {};
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({
          ...filterOptions,
          skip,
          take: limit
        }),
        this.model.count({ where: (filterOptions as any)?.where || {} })
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      throw new DatabaseException(`Failed to find ${this.modelName} records`, error);
    }
  }

  async update(id: ID, data: Partial<T>): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundExceptionInfra(this.modelName, String(id));
      }
      throw new DatabaseException(`Failed to update ${this.modelName}`, error);
    }
  }

  async delete(id: ID): Promise<void> {
    try {
      await this.model.delete({ where: { id } });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundExceptionInfra(this.modelName, String(id));
      }
      throw new DatabaseException(`Failed to delete ${this.modelName}`, error);
    }
  }

  async softDelete(id: ID): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false }
      });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundExceptionInfra(this.modelName, String(id));
      }
      throw new DatabaseException(`Failed to soft delete ${this.modelName}`, error);
    }
  }

  async search(options: ISearchOptions & IPaginationOptions): Promise<IPaginatedResult<T>> {
    try {
      const { query, fields, page = 1, limit = 10, caseSensitive = false } = options;
      const skip = (page - 1) * limit;

      const searchConditions = fields.map(field => ({
        [field]: {
          contains: query,
          mode: caseSensitive ? 'default' : 'insensitive'
        }
      }));

      const where = { OR: searchConditions };

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit
        }),
        this.model.count({ where })
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      throw new DatabaseException(`Failed to search ${this.modelName}`, error);
    }
  }

  async getStats(options?: IStatsOptions): Promise<Record<string, any>> {
    try {
      const { groupBy, aggregations, dateRange, filters } = options || {};
      
      let where = filters || {};
      if (dateRange) {
        where.createdAt = {
          gte: dateRange.from,
          lte: dateRange.to
        };
      }

      if (groupBy) {
        return await this.model.groupBy({
          by: groupBy,
          where,
          _count: true,
          ...(aggregations && this.buildAggregations(aggregations))
        });
      }

      return await this.model.aggregate({
        where,
        _count: true,
        ...(aggregations && this.buildAggregations(aggregations))
      });
    } catch (error) {
      throw new DatabaseException(`Failed to get ${this.modelName} stats`, error);
    }
  }

  async bulkCreate(data: Partial<T>[]): Promise<T[]> {
    try {
      return await this.model.createMany({
        data,
        skipDuplicates: true
      });
    } catch (error) {
      throw new DatabaseException(`Failed to bulk create ${this.modelName}`, error);
    }
  }

  async bulkUpdate(ids: ID[], data: Partial<T>): Promise<number> {
    try {
      const result = await this.model.updateMany({
        where: { id: { in: ids } },
        data
      });
      return result.count;
    } catch (error) {
      throw new DatabaseException(`Failed to bulk update ${this.modelName}`, error);
    }
  }

  async bulkDelete(ids: ID[]): Promise<number> {
    try {
      const result = await this.model.deleteMany({
        where: { id: { in: ids } }
      });
      return result.count;
    } catch (error) {
      throw new DatabaseException(`Failed to bulk delete ${this.modelName}`, error);
    }
  }

  async count(options?: IFilterOptions): Promise<number> {
    try {
      return await this.model.count({
        where: options?.where
      });
    } catch (error) {
      throw new DatabaseException(`Failed to count ${this.modelName}`, error);
    }
  }

  async exists(id: ID): Promise<boolean> {
    try {
      const record = await this.model.findUnique({
        where: { id },
        select: { id: true }
      });
      return !!record;
    } catch (error) {
      throw new DatabaseException(`Failed to check ${this.modelName} existence`, error);
    }
  }

  private buildAggregations(aggregations: Record<string, 'count' | 'sum' | 'avg' | 'min' | 'max'>) {
    const result: any = {};
    
    Object.entries(aggregations).forEach(([field, operation]) => {
      if (!result[`_${operation}`]) {
        result[`_${operation}`] = {};
      }
      result[`_${operation}`][field] = true;
    });

    return result;
  }
}