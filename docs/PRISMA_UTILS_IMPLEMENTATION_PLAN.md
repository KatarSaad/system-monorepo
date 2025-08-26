# Prisma Utils Implementation Plan

## 🎯 Implementation Roadmap

Based on the analysis of your monorepo, here's the detailed implementation plan for creating flexible, modular Prisma-based utils modules.

## 📋 Current System Assessment

### ✅ Available Foundation
- **@system/core**: Complete with DDD patterns, Result types, Logger, Cache
- **@system/infrastructure**: Prisma integration with repository patterns
- **@system/monitoring**: Metrics and observability
- **@system/validation**: Input validation and sanitization
- **Database Schema**: MySQL with User, Session, AuditLog models

### ⚠️ Implementation Gaps
1. **Generic Repository Pattern**: Need abstract base with advanced operations
2. **Query Builder**: Fluent interface for complex queries
3. **Filter Engine**: Dynamic filtering with type safety
4. **Stats Aggregator**: Real-time analytics and reporting
5. **Search Engine**: Full-text search with ranking
6. **Domain-Specific Utils**: Tickets, reservations, etc.

## 🏗️ Package Creation Strategy

### 1. Core Prisma Utils Package

**Package**: `@system/prisma-utils`

**Dependencies**:
```json
{
  "dependencies": {
    "@system/core": "workspace:*",
    "@system/infrastructure": "workspace:*",
    "@system/monitoring": "workspace:*",
    "@system/validation": "workspace:*",
    "@prisma/client": "^5.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

**Structure**:
```
packages/prisma-utils/
├── src/
│   ├── abstracts/
│   │   ├── base-repository.abstract.ts
│   │   ├── base-service.abstract.ts
│   │   └── base-utils.abstract.ts
│   ├── builders/
│   │   ├── query-builder.ts
│   │   ├── filter-builder.ts
│   │   └── stats-builder.ts
│   ├── engines/
│   │   ├── search-engine.ts
│   │   ├── filter-engine.ts
│   │   └── stats-engine.ts
│   ├── interfaces/
│   │   ├── repository.interface.ts
│   │   ├── query.interface.ts
│   │   ├── filter.interface.ts
│   │   ├── stats.interface.ts
│   │   └── search.interface.ts
│   ├── processors/
│   │   ├── data-processor.ts
│   │   ├── validation-processor.ts
│   │   └── transformation-processor.ts
│   ├── utils/
│   │   ├── query.utils.ts
│   │   ├── type.utils.ts
│   │   └── performance.utils.ts
│   ├── decorators/
│   │   ├── cacheable.decorator.ts
│   │   ├── measurable.decorator.ts
│   │   └── validatable.decorator.ts
│   ├── prisma-utils.module.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Domain-Specific Packages

#### A. Tickets Utils Package

**Package**: `@system/tickets-utils`

**Features**:
- Ticket lifecycle management
- Priority-based operations
- Status transitions
- Assignment algorithms
- SLA tracking
- Escalation workflows

#### B. Reservations Utils Package

**Package**: `@system/reservations-utils`

**Features**:
- Availability checking
- Conflict resolution
- Time slot management
- Capacity planning
- Booking analytics
- Cancellation handling

#### C. Stats Utils Package

**Package**: `@system/stats-utils`

**Features**:
- Real-time aggregations
- Time-series analysis
- Trend calculations
- Comparative analytics
- Custom metrics
- Performance monitoring

#### D. Filters Utils Package

**Package**: `@system/filters-utils`

**Features**:
- Dynamic filter building
- Complex condition chaining
- Type-safe filtering
- Performance optimization
- Filter presets
- Query caching

#### E. Search Utils Package

**Package**: `@system/search-utils`

**Features**:
- Full-text search
- Faceted search
- Auto-complete
- Search analytics
- Result ranking
- Search suggestions

## 💻 Core Implementation Examples

### 1. Base Repository Abstract

```typescript
// packages/prisma-utils/src/abstracts/base-repository.abstract.ts
import { PrismaClient } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { Result, CacheService } from '@system/core';
import { MetricsService } from '@system/monitoring';
import { 
  IBaseRepository, 
  QueryOptions, 
  FilterOptions, 
  StatsOptions,
  SearchOptions,
  PaginatedResult,
  BulkOperation 
} from '../interfaces';

@Injectable()
export abstract class BaseRepository<T, ID = string> implements IBaseRepository<T, ID> {
  protected abstract readonly modelName: string;
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly cache?: CacheService,
    protected readonly metrics?: MetricsService
  ) {}

  @Measurable()
  @Cacheable({ ttl: 300 })
  async findById(id: ID, options?: QueryOptions<T>): Promise<Result<T | null>> {
    try {
      const result = await this.prisma[this.modelName].findUnique({
        where: { id },
        ...this.buildPrismaOptions(options)
      });

      this.metrics?.incrementCounter('repository_find_by_id', 1, {
        model: this.modelName,
        found: result ? 'true' : 'false'
      });

      return Result.ok(result);
    } catch (error) {
      this.logger.error(`Failed to find ${this.modelName} by id ${id}:`, error);
      this.metrics?.incrementCounter('repository_errors', 1, {
        model: this.modelName,
        operation: 'findById'
      });
      return Result.fail(`Failed to find ${this.modelName}: ${error.message}`);
    }
  }

  @Measurable()
  async findMany(options?: QueryOptions<T>): Promise<Result<PaginatedResult<T>>> {
    try {
      const { pagination, ...queryOptions } = options || {};
      const { page = 1, limit = 10 } = pagination || {};
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma[this.modelName].findMany({
          ...this.buildPrismaOptions(queryOptions),
          skip,
          take: limit
        }),
        this.prisma[this.modelName].count({
          where: queryOptions?.where
        })
      ]);

      const result: PaginatedResult<T> = {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      };

      this.metrics?.incrementCounter('repository_find_many', 1, {
        model: this.modelName,
        count: data.length.toString()
      });

      return Result.ok(result);
    } catch (error) {
      this.logger.error(`Failed to find many ${this.modelName}:`, error);
      return Result.fail(`Failed to find ${this.modelName} records: ${error.message}`);
    }
  }

  @Measurable()
  async create(data: Partial<T>): Promise<Result<T>> {
    try {
      const result = await this.prisma[this.modelName].create({
        data: this.processCreateData(data)
      });

      this.metrics?.incrementCounter('repository_create', 1, {
        model: this.modelName
      });

      // Invalidate related cache
      await this.invalidateCache(['list', 'stats']);

      return Result.ok(result);
    } catch (error) {
      this.logger.error(`Failed to create ${this.modelName}:`, error);
      return Result.fail(`Failed to create ${this.modelName}: ${error.message}`);
    }
  }

  @Measurable()
  async update(id: ID, data: Partial<T>): Promise<Result<T>> {
    try {
      const result = await this.prisma[this.modelName].update({
        where: { id },
        data: this.processUpdateData(data)
      });

      this.metrics?.incrementCounter('repository_update', 1, {
        model: this.modelName
      });

      // Invalidate related cache
      await this.invalidateCache([`item:${id}`, 'list', 'stats']);

      return Result.ok(result);
    } catch (error) {
      this.logger.error(`Failed to update ${this.modelName} ${id}:`, error);
      return Result.fail(`Failed to update ${this.modelName}: ${error.message}`);
    }
  }

  @Measurable()
  async delete(id: ID): Promise<Result<void>> {
    try {
      await this.prisma[this.modelName].delete({
        where: { id }
      });

      this.metrics?.incrementCounter('repository_delete', 1, {
        model: this.modelName
      });

      // Invalidate related cache
      await this.invalidateCache([`item:${id}`, 'list', 'stats']);

      return Result.ok();
    } catch (error) {
      this.logger.error(`Failed to delete ${this.modelName} ${id}:`, error);
      return Result.fail(`Failed to delete ${this.modelName}: ${error.message}`);
    }
  }

  // Advanced operations
  abstract search(options: SearchOptions): Promise<Result<PaginatedResult<T>>>;
  abstract filter(options: FilterOptions<T>): Promise<Result<T[]>>;
  abstract getStats(options: StatsOptions): Promise<Result<any>>;
  abstract bulkOperations(operations: BulkOperation<T>[]): Promise<Result<any>>;

  // Helper methods
  protected buildPrismaOptions(options?: QueryOptions<T>): any {
    if (!options) return {};

    return {
      where: options.where,
      orderBy: options.orderBy,
      include: options.include,
      select: options.select
    };
  }

  protected processCreateData(data: Partial<T>): any {
    // Override in subclasses for custom processing
    return data;
  }

  protected processUpdateData(data: Partial<T>): any {
    // Override in subclasses for custom processing
    return data;
  }

  protected async invalidateCache(patterns: string[]): Promise<void> {
    if (!this.cache) return;

    try {
      await Promise.all(
        patterns.map(pattern => 
          this.cache.invalidateByPattern(new RegExp(`${this.modelName}:${pattern}`))
        )
      );
    } catch (error) {
      this.logger.warn('Failed to invalidate cache:', error);
    }
  }
}
```

### 2. Query Builder Implementation

```typescript
// packages/prisma-utils/src/builders/query-builder.ts
import { PrismaClient } from '@prisma/client';
import { QueryOptions, FilterCondition, OrderByInput } from '../interfaces';

export class QueryBuilder<T> {
  private conditions: any[] = [];
  private orderByClause: any[] = [];
  private includeClause: any = {};
  private selectClause: any = {};
  private limitValue?: number;
  private skipValue?: number;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly modelName: string
  ) {}

  where(field: keyof T, operator: string, value: any): this {
    this.conditions.push(this.buildCondition(field, operator, value));
    return this;
  }

  whereIn(field: keyof T, values: any[]): this {
    this.conditions.push({ [field]: { in: values } });
    return this;
  }

  whereBetween(field: keyof T, min: any, max: any): this {
    this.conditions.push({ 
      [field]: { gte: min, lte: max } 
    });
    return this;
  }

  whereSearch(fields: (keyof T)[], query: string): this {
    const searchConditions = fields.map(field => ({
      [field]: { 
        contains: query, 
        mode: 'insensitive' 
      }
    }));
    this.conditions.push({ OR: searchConditions });
    return this;
  }

  whereHas(relation: string, callback: (builder: QueryBuilder<any>) => void): this {
    const relationBuilder = new QueryBuilder(this.prisma, relation);
    callback(relationBuilder);
    
    this.conditions.push({
      [relation]: {
        some: relationBuilder.getWhereClause()
      }
    });
    return this;
  }

  orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByClause.push({ [field]: direction });
    return this;
  }

  include(relations: Record<string, boolean | any>): this {
    this.includeClause = { ...this.includeClause, ...relations };
    return this;
  }

  select(fields: Record<keyof T, boolean>): this {
    this.selectClause = { ...this.selectClause, ...fields };
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  skip(count: number): this {
    this.skipValue = count;
    return this;
  }

  paginate(page: number, limit: number): this {
    this.limitValue = limit;
    this.skipValue = (page - 1) * limit;
    return this;
  }

  async execute(): Promise<T[]> {
    const query: any = {};

    if (this.conditions.length > 0) {
      query.where = this.conditions.length === 1 
        ? this.conditions[0] 
        : { AND: this.conditions };
    }

    if (this.orderByClause.length > 0) {
      query.orderBy = this.orderByClause;
    }

    if (Object.keys(this.includeClause).length > 0) {
      query.include = this.includeClause;
    }

    if (Object.keys(this.selectClause).length > 0) {
      query.select = this.selectClause;
    }

    if (this.limitValue) {
      query.take = this.limitValue;
    }

    if (this.skipValue) {
      query.skip = this.skipValue;
    }

    return this.prisma[this.modelName].findMany(query);
  }

  async count(): Promise<number> {
    const whereClause = this.conditions.length > 0 
      ? (this.conditions.length === 1 ? this.conditions[0] : { AND: this.conditions })
      : undefined;

    return this.prisma[this.modelName].count({
      where: whereClause
    });
  }

  async first(): Promise<T | null> {
    const results = await this.limit(1).execute();
    return results[0] || null;
  }

  getWhereClause(): any {
    return this.conditions.length === 1 
      ? this.conditions[0] 
      : { AND: this.conditions };
  }

  private buildCondition(field: keyof T, operator: string, value: any): any {
    switch (operator) {
      case 'equals':
      case '=':
        return { [field]: value };
      case 'not':
      case '!=':
        return { [field]: { not: value } };
      case 'gt':
      case '>':
        return { [field]: { gt: value } };
      case 'gte':
      case '>=':
        return { [field]: { gte: value } };
      case 'lt':
      case '<':
        return { [field]: { lt: value } };
      case 'lte':
      case '<=':
        return { [field]: { lte: value } };
      case 'contains':
        return { [field]: { contains: value, mode: 'insensitive' } };
      case 'startsWith':
        return { [field]: { startsWith: value, mode: 'insensitive' } };
      case 'endsWith':
        return { [field]: { endsWith: value, mode: 'insensitive' } };
      case 'in':
        return { [field]: { in: Array.isArray(value) ? value : [value] } };
      case 'notIn':
        return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}
```

### 3. Tickets Utils Implementation

```typescript
// packages/tickets-utils/src/services/ticket-utils.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '@system/prisma-utils';
import { Result, CacheService } from '@system/core';
import { MetricsService } from '@system/monitoring';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  reporterId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  dueDate?: Date;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TicketStatsOptions {
  dateRange?: { start: Date; end: Date };
  groupBy?: ('status' | 'priority' | 'assignee')[];
  includeResolutionTime?: boolean;
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  averageResolutionTime?: number;
  slaCompliance?: number;
}

@Injectable()
export class TicketUtilsService extends BaseRepository<Ticket> {
  protected readonly modelName = 'ticket';

  constructor(
    prisma: PrismaClient,
    cache?: CacheService,
    metrics?: MetricsService
  ) {
    super(prisma, cache, metrics);
  }

  async findByStatus(status: TicketStatus): Promise<Result<Ticket[]>> {
    try {
      const tickets = await this.prisma.ticket.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' }
      });

      return Result.ok(tickets);
    } catch (error) {
      return Result.fail(`Failed to find tickets by status: ${error.message}`);
    }
  }

  async findByPriority(priority: TicketPriority): Promise<Result<Ticket[]>> {
    try {
      const tickets = await this.prisma.ticket.findMany({
        where: { priority },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });

      return Result.ok(tickets);
    } catch (error) {
      return Result.fail(`Failed to find tickets by priority: ${error.message}`);
    }
  }

  async findOverdueTickets(): Promise<Result<Ticket[]>> {
    try {
      const now = new Date();
      const tickets = await this.prisma.ticket.findMany({
        where: {
          dueDate: { lt: now },
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] }
        },
        orderBy: { dueDate: 'asc' }
      });

      return Result.ok(tickets);
    } catch (error) {
      return Result.fail(`Failed to find overdue tickets: ${error.message}`);
    }
  }

  async assignTicket(ticketId: string, assigneeId: string): Promise<Result<Ticket>> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: { id: ticketId },
        data: { 
          assigneeId,
          status: TicketStatus.IN_PROGRESS,
          updatedAt: new Date()
        }
      });

      this.metrics?.incrementCounter('tickets_assigned', 1, {
        priority: ticket.priority
      });

      return Result.ok(ticket);
    } catch (error) {
      return Result.fail(`Failed to assign ticket: ${error.message}`);
    }
  }

  async resolveTicket(ticketId: string, resolutionNote?: string): Promise<Result<Ticket>> {
    try {
      const ticket = await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: TicketStatus.RESOLVED,
          resolvedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Calculate resolution time
      const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      this.metrics?.observeHistogram('ticket_resolution_time', resolutionTime, 
        [3600000, 86400000, 604800000], // 1 hour, 1 day, 1 week in ms
        'Ticket resolution time',
        { priority: ticket.priority }
      );

      return Result.ok(ticket);
    } catch (error) {
      return Result.fail(`Failed to resolve ticket: ${error.message}`);
    }
  }

  async getTicketStats(options: TicketStatsOptions = {}): Promise<Result<TicketStats>> {
    try {
      const { dateRange, groupBy = ['status', 'priority'], includeResolutionTime = true } = options;
      
      let whereClause: any = {};
      if (dateRange) {
        whereClause.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }

      // Get total count
      const total = await this.prisma.ticket.count({ where: whereClause });

      // Get status breakdown
      const statusStats = await this.prisma.ticket.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true }
      });

      // Get priority breakdown
      const priorityStats = await this.prisma.ticket.groupBy({
        by: ['priority'],
        where: whereClause,
        _count: { id: true }
      });

      const byStatus = statusStats.reduce((acc, stat) => {
        acc[stat.status as TicketStatus] = stat._count.id;
        return acc;
      }, {} as Record<TicketStatus, number>);

      const byPriority = priorityStats.reduce((acc, stat) => {
        acc[stat.priority as TicketPriority] = stat._count.id;
        return acc;
      }, {} as Record<TicketPriority, number>);

      const stats: TicketStats = {
        total,
        byStatus,
        byPriority
      };

      // Calculate average resolution time if requested
      if (includeResolutionTime) {
        const resolvedTickets = await this.prisma.ticket.findMany({
          where: {
            ...whereClause,
            status: TicketStatus.RESOLVED,
            resolvedAt: { not: null }
          },
          select: {
            createdAt: true,
            resolvedAt: true
          }
        });

        if (resolvedTickets.length > 0) {
          const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => {
            return sum + (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime());
          }, 0);
          
          stats.averageResolutionTime = totalResolutionTime / resolvedTickets.length;
        }
      }

      return Result.ok(stats);
    } catch (error) {
      return Result.fail(`Failed to get ticket stats: ${error.message}`);
    }
  }

  async searchTickets(query: string, options: {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    assigneeId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<Result<{ tickets: Ticket[]; total: number }>> {
    try {
      const { status, priority, assigneeId, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      let whereClause: any = {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ]
      };

      if (status?.length) {
        whereClause.status = { in: status };
      }

      if (priority?.length) {
        whereClause.priority = { in: priority };
      }

      if (assigneeId) {
        whereClause.assigneeId = assigneeId;
      }

      const [tickets, total] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereClause,
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        this.prisma.ticket.count({ where: whereClause })
      ]);

      this.metrics?.incrementCounter('ticket_searches', 1, {
        query_length: query.length.toString(),
        results_count: tickets.length.toString()
      });

      return Result.ok({ tickets, total });
    } catch (error) {
      return Result.fail(`Failed to search tickets: ${error.message}`);
    }
  }

  // Implementation of abstract methods
  async search(options: any): Promise<Result<any>> {
    return this.searchTickets(options.query, options);
  }

  async filter(options: any): Promise<Result<Ticket[]>> {
    // Implement complex filtering logic
    return Result.ok([]);
  }

  async getStats(options: any): Promise<Result<any>> {
    return this.getTicketStats(options);
  }

  async bulkOperations(operations: any[]): Promise<Result<any>> {
    // Implement bulk operations
    return Result.ok({});
  }
}
```

### 4. Module Configuration

```typescript
// packages/tickets-utils/src/tickets-utils.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { PrismaUtilsModule } from '@system/prisma-utils';
import { CoreModule } from '@system/core';
import { MonitoringModule } from '@system/monitoring';
import { TicketUtilsService } from './services/ticket-utils.service';

export interface TicketUtilsModuleOptions {
  global?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  cacheConfig?: {
    ttl: number;
    maxSize: number;
  };
}

@Module({})
export class TicketUtilsModule {
  static forRoot(options: TicketUtilsModuleOptions = {}): DynamicModule {
    const providers = [TicketUtilsService];

    return {
      module: TicketUtilsModule,
      imports: [
        PrismaUtilsModule.forRoot(),
        CoreModule.forFeature(['cache', 'logger']),
        ...(options.enableMetrics ? [MonitoringModule.forFeature(['metrics'])] : [])
      ],
      providers,
      exports: providers,
      global: options.global || false
    };
  }

  static forFeature(features: string[] = []): DynamicModule {
    const providers = features.includes('tickets') ? [TicketUtilsService] : [];

    return {
      module: TicketUtilsModule,
      providers,
      exports: providers
    };
  }
}
```

## 🚀 Quick Start Implementation

### Step 1: Create Core Package
```bash
# Create the core prisma-utils package
mkdir -p packages/prisma-utils/src/{abstracts,builders,engines,interfaces,processors,utils,decorators}
cd packages/prisma-utils
npm init -y
```

### Step 2: Install Dependencies
```bash
npm install @system/core @system/infrastructure @system/monitoring @system/validation @prisma/client class-validator class-transformer
```

### Step 3: Implement Base Classes
- Copy the `BaseRepository` abstract class
- Implement the `QueryBuilder` class
- Create interface definitions

### Step 4: Create Domain Packages
```bash
# Create tickets-utils package
mkdir -p packages/tickets-utils/src/{services,interfaces,decorators}
cd packages/tickets-utils
npm init -y
npm install @system/prisma-utils @system/core @system/monitoring
```

### Step 5: Integration Testing
```typescript
// Example integration test
describe('TicketUtilsService', () => {
  let service: TicketUtilsService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [TicketUtilsModule.forRoot({ enableMetrics: true })],
    }).compile();

    service = module.get<TicketUtilsService>(TicketUtilsService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should find tickets by priority', async () => {
    const result = await service.findByPriority(TicketPriority.HIGH);
    expect(result.isSuccess).toBe(true);
  });

  it('should get ticket statistics', async () => {
    const result = await service.getTicketStats();
    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveProperty('total');
    expect(result.value).toHaveProperty('byStatus');
  });
});
```

## 📊 Performance Optimization

### Caching Strategy
```typescript
// Implement smart caching
@Cacheable({ 
  ttl: 300, 
  key: (args) => `tickets:priority:${args[0]}`,
  invalidateOn: ['ticket:created', 'ticket:updated']
})
async findByPriority(priority: TicketPriority): Promise<Result<Ticket[]>> {
  // Implementation
}
```

### Database Optimization
```sql
-- Recommended indexes for ticket operations
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_due_date ON tickets(due_date);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_search ON tickets(title, description);
```

### Monitoring Integration
```typescript
// Add comprehensive metrics
this.metrics?.createHistogram('ticket_operation_duration', 'Ticket operation duration');
this.metrics?.createCounter('ticket_operations_total', 'Total ticket operations');
this.metrics?.createGauge('tickets_by_status', 'Tickets grouped by status');
```

This implementation plan provides a solid foundation for creating flexible, modular, and maintainable Prisma-based utilities that follow SOLID principles and enterprise best practices.