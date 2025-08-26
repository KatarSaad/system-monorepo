import { Result } from '../common/result';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

export interface DatabaseAdapter {
  connect(): Promise<Result<void>>;
  disconnect(): Promise<Result<void>>;
  isConnected(): boolean;
  executeQuery<T>(query: string, params?: any[]): Promise<Result<T[]>>;
  executeTransaction<T>(operations: (() => Promise<T>)[]): Promise<Result<T[]>>;
}

export interface QueryBuilder {
  select(fields: string[]): QueryBuilder;
  from(table: string): QueryBuilder;
  where(condition: string, value?: any): QueryBuilder;
  join(table: string, condition: string): QueryBuilder;
  orderBy(field: string, direction?: 'ASC' | 'DESC'): QueryBuilder;
  limit(count: number): QueryBuilder;
  offset(count: number): QueryBuilder;
  build(): { query: string; params: any[] };
}

export abstract class BaseRepository<T, ID> {
  constructor(protected readonly db: DatabaseAdapter) {}

  abstract findById(id: ID): Promise<Result<T | null>>;
  abstract save(entity: T): Promise<Result<void>>;
  abstract delete(id: ID): Promise<Result<void>>;
  abstract findAll(pagination?: PaginationDto): Promise<Result<PaginatedResponseDto<T>>>;

  protected async executeWithTransaction<R>(
    operations: (() => Promise<R>)[]
  ): Promise<Result<R[]>> {
    return this.db.executeTransaction(operations);
  }

  protected buildPaginatedResponse<T>(
    data: T[],
    total: number,
    pagination: PaginationDto
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }
}

export class SimpleQueryBuilder implements QueryBuilder {
  private selectFields: string[] = ['*'];
  private fromTable: string = '';
  private whereConditions: Array<{ condition: string; value?: any }> = [];
  private joinClauses: string[] = [];
  private orderByClause: string = '';
  private limitCount: number = 0;
  private offsetCount: number = 0;
  private params: any[] = [];

  select(fields: string[]): QueryBuilder {
    this.selectFields = fields;
    return this;
  }

  from(table: string): QueryBuilder {
    this.fromTable = table;
    return this;
  }

  where(condition: string, value?: any): QueryBuilder {
    this.whereConditions.push({ condition, value });
    if (value !== undefined) {
      this.params.push(value);
    }
    return this;
  }

  join(table: string, condition: string): QueryBuilder {
    this.joinClauses.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitCount = count;
    return this;
  }

  offset(count: number): QueryBuilder {
    this.offsetCount = count;
    return this;
  }

  build(): { query: string; params: any[] } {
    let query = `SELECT ${this.selectFields.join(', ')} FROM ${this.fromTable}`;
    
    if (this.joinClauses.length > 0) {
      query += ` ${this.joinClauses.join(' ')}`;
    }
    
    if (this.whereConditions.length > 0) {
      const conditions = this.whereConditions.map(w => w.condition).join(' AND ');
      query += ` WHERE ${conditions}`;
    }
    
    if (this.orderByClause) {
      query += ` ${this.orderByClause}`;
    }
    
    if (this.limitCount > 0) {
      query += ` LIMIT ${this.limitCount}`;
    }
    
    if (this.offsetCount > 0) {
      query += ` OFFSET ${this.offsetCount}`;
    }
    
    return { query, params: this.params };
  }
}