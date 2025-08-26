import { PrismaClient } from '@prisma/client';
import { IFilterOptions, IPaginationOptions, ISearchOptions } from '../interfaces/repository.interface';
import { DatabaseException } from '../exceptions/infrastructure.exceptions';

export interface ICacheOptions {
  ttl?: number;
  tags?: string[];
  key?: string;
}

export class QueryBuilder<T> {
  private whereClause: any = {};
  private includeClause: any = {};
  private selectClause: any = {};
  private orderByClause: any = {};
  private paginationOptions: IPaginationOptions = { page: 1, limit: 10 };
  private searchOptions?: ISearchOptions;
  private cacheOptions?: ICacheOptions;

  constructor(
    private prisma: PrismaClient,
    private modelName: string
  ) {}

  private get model() {
    return (this.prisma as any)[this.modelName];
  }

  where(conditions: Record<string, any>): QueryBuilder<T> {
    this.whereClause = { ...this.whereClause, ...conditions };
    return this;
  }

  include(relations: string[] | Record<string, any>): QueryBuilder<T> {
    if (Array.isArray(relations)) {
      relations.forEach(relation => {
        this.includeClause[relation] = true;
      });
    } else {
      this.includeClause = { ...this.includeClause, ...relations };
    }
    return this;
  }

  select(fields: string[] | Record<string, boolean>): QueryBuilder<T> {
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        this.selectClause[field] = true;
      });
    } else {
      this.selectClause = { ...this.selectClause, ...fields };
    }
    return this;
  }

  orderBy(order: Record<string, 'asc' | 'desc'>): QueryBuilder<T> {
    this.orderByClause = { ...this.orderByClause, ...order };
    return this;
  }

  paginate(options: IPaginationOptions): QueryBuilder<T> {
    this.paginationOptions = options;
    return this;
  }

  search(options: ISearchOptions): QueryBuilder<T> {
    this.searchOptions = options;
    return this;
  }

  cache(options: ICacheOptions): QueryBuilder<T> {
    this.cacheOptions = options;
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this.paginationOptions.limit = count;
    return this;
  }

  offset(count: number): QueryBuilder<T> {
    this.paginationOptions.skip = count;
    return this;
  }

  async execute(): Promise<T[]> {
    try {
      const query = this.buildQuery();
      return await this.model.findMany(query);
    } catch (error) {
      throw new DatabaseException(`Failed to execute query for ${this.modelName}`, error);
    }
  }

  async executeWithPagination() {
    try {
      const query = this.buildQuery();
      const { page = 1, limit = 10 } = this.paginationOptions;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model.findMany({ ...query, skip, take: limit }),
        this.model.count({ where: query.where })
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
      throw new DatabaseException(`Failed to execute paginated query for ${this.modelName}`, error);
    }
  }

  async executeOne(): Promise<T | null> {
    try {
      const query = this.buildQuery();
      return await this.model.findFirst(query);
    } catch (error) {
      throw new DatabaseException(`Failed to execute single query for ${this.modelName}`, error);
    }
  }

  async count(): Promise<number> {
    try {
      const query = this.buildQuery();
      return await this.model.count({ where: query.where });
    } catch (error) {
      throw new DatabaseException(`Failed to count ${this.modelName}`, error);
    }
  }

  async exists(): Promise<boolean> {
    try {
      const count = await this.count();
      return count > 0;
    } catch (error) {
      throw new DatabaseException(`Failed to check existence for ${this.modelName}`, error);
    }
  }

  private buildQuery(): any {
    let query: any = {};

    // Build where clause
    if (Object.keys(this.whereClause).length > 0) {
      query.where = this.whereClause;
    }

    // Add search conditions
    if (this.searchOptions) {
      const { query: searchQuery, fields, caseSensitive = false } = this.searchOptions;
      const searchConditions = fields.map(field => ({
        [field]: {
          contains: searchQuery,
          mode: caseSensitive ? 'default' : 'insensitive'
        }
      }));

      if (query.where) {
        query.where = {
          AND: [
            query.where,
            { OR: searchConditions }
          ]
        };
      } else {
        query.where = { OR: searchConditions };
      }
    }

    // Add include clause
    if (Object.keys(this.includeClause).length > 0) {
      query.include = this.includeClause;
    }

    // Add select clause
    if (Object.keys(this.selectClause).length > 0) {
      query.select = this.selectClause;
    }

    // Add order by clause
    if (Object.keys(this.orderByClause).length > 0) {
      query.orderBy = this.orderByClause;
    }

    return query;
  }

  // Advanced query methods
  whereIn(field: string, values: any[]): QueryBuilder<T> {
    this.whereClause[field] = { in: values };
    return this;
  }

  whereNotIn(field: string, values: any[]): QueryBuilder<T> {
    this.whereClause[field] = { notIn: values };
    return this;
  }

  whereBetween(field: string, min: any, max: any): QueryBuilder<T> {
    this.whereClause[field] = { gte: min, lte: max };
    return this;
  }

  whereNull(field: string): QueryBuilder<T> {
    this.whereClause[field] = null;
    return this;
  }

  whereNotNull(field: string): QueryBuilder<T> {
    this.whereClause[field] = { not: null };
    return this;
  }

  whereLike(field: string, pattern: string): QueryBuilder<T> {
    this.whereClause[field] = { contains: pattern };
    return this;
  }

  whereDate(field: string, date: Date): QueryBuilder<T> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    this.whereClause[field] = {
      gte: startOfDay,
      lte: endOfDay
    };
    return this;
  }

  whereDateRange(field: string, from: Date, to: Date): QueryBuilder<T> {
    this.whereClause[field] = {
      gte: from,
      lte: to
    };
    return this;
  }

  // Aggregation methods
  async sum(field: string): Promise<number> {
    try {
      const result = await this.model.aggregate({
        where: this.whereClause,
        _sum: { [field]: true }
      });
      return result._sum[field] || 0;
    } catch (error) {
      throw new DatabaseException(`Failed to sum ${field} for ${this.modelName}`, error);
    }
  }

  async avg(field: string): Promise<number> {
    try {
      const result = await this.model.aggregate({
        where: this.whereClause,
        _avg: { [field]: true }
      });
      return result._avg[field] || 0;
    } catch (error) {
      throw new DatabaseException(`Failed to average ${field} for ${this.modelName}`, error);
    }
  }

  async min(field: string): Promise<any> {
    try {
      const result = await this.model.aggregate({
        where: this.whereClause,
        _min: { [field]: true }
      });
      return result._min[field];
    } catch (error) {
      throw new DatabaseException(`Failed to get min ${field} for ${this.modelName}`, error);
    }
  }

  async max(field: string): Promise<any> {
    try {
      const result = await this.model.aggregate({
        where: this.whereClause,
        _max: { [field]: true }
      });
      return result._max[field];
    } catch (error) {
      throw new DatabaseException(`Failed to get max ${field} for ${this.modelName}`, error);
    }
  }

  async groupBy(fields: string[]): Promise<any[]> {
    try {
      return await this.model.groupBy({
        by: fields,
        where: this.whereClause,
        _count: true
      });
    } catch (error) {
      throw new DatabaseException(`Failed to group by ${fields.join(', ')} for ${this.modelName}`, error);
    }
  }
}

export class QueryBuilderFactory {
  constructor(private prisma: PrismaClient) {}

  create<T>(modelName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this.prisma, modelName);
  }
}