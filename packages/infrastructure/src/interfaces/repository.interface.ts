export interface IFilterOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, any>;
  select?: Record<string, boolean>;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
  skip?: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ISearchOptions {
  query: string;
  fields: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
}

export interface IStatsOptions {
  groupBy?: string[];
  aggregations?: Record<string, 'count' | 'sum' | 'avg' | 'min' | 'max'>;
  dateRange?: { from: Date; to: Date };
  filters?: Record<string, any>;
}

export interface IBaseRepository<T, ID = string> {
  create(data: Partial<T>): Promise<T>;
  findById(id: ID, options?: IFilterOptions): Promise<T | null>;
  findMany(options?: IFilterOptions & IPaginationOptions): Promise<IPaginatedResult<T>>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  softDelete(id: ID): Promise<T>;
  search(options: ISearchOptions & IPaginationOptions): Promise<IPaginatedResult<T>>;
  getStats(options?: IStatsOptions): Promise<Record<string, any>>;
  bulkCreate(data: Partial<T>[]): Promise<T[]>;
  bulkUpdate(ids: ID[], data: Partial<T>): Promise<number>;
  bulkDelete(ids: ID[]): Promise<number>;
  count(options?: IFilterOptions): Promise<number>;
  exists(id: ID): Promise<boolean>;
}