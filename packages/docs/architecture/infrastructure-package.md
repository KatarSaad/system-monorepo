# @system/infrastructure Package Architecture

## Overview
Database access layer, repository patterns, and infrastructure services.

## Current Structure
```
src/
├── core/
│   ├── infrastructure.ts
│   ├── repository-factory.ts
│   └── query-builder.ts
├── interfaces/
│   └── repository.interface.ts
├── services/
│   └── prisma.service.ts
├── modules/
│   ├── database.module.ts
│   └── infrastructure.module.ts
├── exceptions/
│   └── infrastructure.exceptions.ts
└── index.ts
```

## Architecture Principles

### 1. **Repository Pattern**
- Abstract data access behind interfaces
- Domain-driven repository design
- Generic repository with specific implementations

### 2. **Unit of Work**
- Transaction management
- Change tracking
- Batch operations

### 3. **Query Builder**
- Type-safe query construction
- Fluent API design
- Database-agnostic queries

## Best Practices

### ✅ **Module Structure**
```typescript
@Global()
@Module({})
export class InfrastructureModule {
  static forRoot(config?: InfrastructureConfig): DynamicModule {
    return {
      module: InfrastructureModule,
      imports: [DatabaseModule.forRoot()],
      providers: [
        {
          provide: 'INFRASTRUCTURE_CONFIG',
          useValue: { ...defaultConfig, ...config },
        },
        PrismaService,
        RepositoryFactory,
        QueryBuilder,
      ],
      exports: [
        PrismaService,
        RepositoryFactory,
        QueryBuilder,
      ],
    };
  }
}
```

### ✅ **Repository Interface**
```typescript
export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<Result<T | null>>;
  findAll(options?: FindOptions): Promise<Result<T[]>>;
  findOne(criteria: Partial<T>): Promise<Result<T | null>>;
  create(entity: Omit<T, 'id'>): Promise<Result<T>>;
  update(id: ID, updates: Partial<T>): Promise<Result<T>>;
  delete(id: ID): Promise<Result<boolean>>;
  count(criteria?: Partial<T>): Promise<Result<number>>;
}

export interface FindOptions {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  include?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### ✅ **Generic Repository Implementation**
```typescript
@Injectable()
export abstract class BaseRepository<T, ID = string> implements IRepository<T, ID> {
  constructor(
    protected prisma: PrismaService,
    protected modelName: string,
    protected logger: Logger
  ) {}

  async findById(id: ID): Promise<Result<T | null>> {
    try {
      const model = this.getModel();
      const entity = await model.findUnique({ where: { id } });
      return Result.ok(entity);
    } catch (error) {
      this.logger.error(`Failed to find ${this.modelName} by id: ${id}`, error);
      return Result.fail(`Find operation failed: ${error.message}`);
    }
  }

  async findAll(options: FindOptions = {}): Promise<Result<T[]>> {
    try {
      const model = this.getModel();
      const entities = await model.findMany({
        where: options.where,
        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        include: options.include,
      });
      return Result.ok(entities);
    } catch (error) {
      this.logger.error(`Failed to find all ${this.modelName}`, error);
      return Result.fail(`Find all operation failed: ${error.message}`);
    }
  }

  async create(data: Omit<T, 'id'>): Promise<Result<T>> {
    try {
      const model = this.getModel();
      const entity = await model.create({ data });
      return Result.ok(entity);
    } catch (error) {
      this.logger.error(`Failed to create ${this.modelName}`, error);
      return Result.fail(`Create operation failed: ${error.message}`);
    }
  }

  async update(id: ID, updates: Partial<T>): Promise<Result<T>> {
    try {
      const model = this.getModel();
      const entity = await model.update({
        where: { id },
        data: updates,
      });
      return Result.ok(entity);
    } catch (error) {
      this.logger.error(`Failed to update ${this.modelName} with id: ${id}`, error);
      return Result.fail(`Update operation failed: ${error.message}`);
    }
  }

  async delete(id: ID): Promise<Result<boolean>> {
    try {
      const model = this.getModel();
      await model.delete({ where: { id } });
      return Result.ok(true);
    } catch (error) {
      this.logger.error(`Failed to delete ${this.modelName} with id: ${id}`, error);
      return Result.fail(`Delete operation failed: ${error.message}`);
    }
  }

  protected getModel() {
    return (this.prisma as any)[this.modelName];
  }
}
```

## Transformation Guidelines

### 1. **Specific Repository Implementation**
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<Result<User | null>>;
  findActiveUsers(): Promise<Result<User[]>>;
  updateLastLogin(id: string): Promise<Result<void>>;
}

@Injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'user', new Logger(UserRepository.name));
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return Result.ok(user);
    } catch (error) {
      this.logger.error(`Failed to find user by email: ${email}`, error);
      return Result.fail(`Find by email failed: ${error.message}`);
    }
  }

  async findActiveUsers(): Promise<Result<User[]>> {
    try {
      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return Result.ok(users);
    } catch (error) {
      this.logger.error('Failed to find active users', error);
      return Result.fail(`Find active users failed: ${error.message}`);
    }
  }

  async updateLastLogin(id: string): Promise<Result<void>> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
      return Result.ok();
    } catch (error) {
      this.logger.error(`Failed to update last login for user: ${id}`, error);
      return Result.fail(`Update last login failed: ${error.message}`);
    }
  }
}
```

### 2. **Unit of Work Pattern**
```typescript
export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<Result<void>>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private transaction: any = null;
  private repositories = new Map<string, any>();

  constructor(private prisma: PrismaService) {}

  async begin(): Promise<void> {
    if (this.transaction) {
      throw new Error('Transaction already active');
    }
    // Prisma transaction will be started when first repository is accessed
  }

  async commit(): Promise<Result<void>> {
    if (!this.transaction) {
      return Result.fail('No active transaction');
    }

    try {
      // Prisma handles transaction commit automatically
      this.transaction = null;
      this.repositories.clear();
      return Result.ok();
    } catch (error) {
      return Result.fail(`Transaction commit failed: ${error.message}`);
    }
  }

  async rollback(): Promise<void> {
    if (this.transaction) {
      // Prisma handles rollback automatically on error
      this.transaction = null;
      this.repositories.clear();
    }
  }

  isActive(): boolean {
    return this.transaction !== null;
  }

  getRepository<T>(repositoryClass: new (...args: any[]) => T): T {
    const key = repositoryClass.name;
    
    if (!this.repositories.has(key)) {
      const repository = new repositoryClass(
        this.transaction || this.prisma
      );
      this.repositories.set(key, repository);
    }

    return this.repositories.get(key);
  }
}
```

### 3. **Query Builder**
```typescript
export class QueryBuilder<T> {
  private query: any = {};

  constructor(private modelName: string, private prisma: PrismaService) {}

  where(conditions: Partial<T> | any): QueryBuilder<T> {
    this.query.where = { ...this.query.where, ...conditions };
    return this;
  }

  orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
    if (!this.query.orderBy) {
      this.query.orderBy = {};
    }
    this.query.orderBy[field as string] = direction;
    return this;
  }

  skip(count: number): QueryBuilder<T> {
    this.query.skip = count;
    return this;
  }

  take(count: number): QueryBuilder<T> {
    this.query.take = count;
    return this;
  }

  include(relations: any): QueryBuilder<T> {
    this.query.include = { ...this.query.include, ...relations };
    return this;
  }

  async findMany(): Promise<Result<T[]>> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const results = await model.findMany(this.query);
      return Result.ok(results);
    } catch (error) {
      return Result.fail(`Query failed: ${error.message}`);
    }
  }

  async findFirst(): Promise<Result<T | null>> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const result = await model.findFirst(this.query);
      return Result.ok(result);
    } catch (error) {
      return Result.fail(`Query failed: ${error.message}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const model = (this.prisma as any)[this.modelName];
      const count = await model.count({ where: this.query.where });
      return Result.ok(count);
    } catch (error) {
      return Result.fail(`Count query failed: ${error.message}`);
    }
  }
}
```

### 4. **Repository Factory**
```typescript
@Injectable()
export class RepositoryFactory {
  constructor(private prisma: PrismaService) {}

  createRepository<T>(modelName: string): BaseRepository<T> {
    return new (class extends BaseRepository<T> {
      constructor() {
        super(prisma, modelName, new Logger(`${modelName}Repository`));
      }
    })();
  }

  createQueryBuilder<T>(modelName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(modelName, this.prisma);
  }
}
```

## Usage Examples

### ✅ **Correct Usage**
```typescript
@Module({
  imports: [
    InfrastructureModule.forRoot({
      database: {
        url: process.env.DATABASE_URL,
        provider: 'postgresql',
      },
    })
  ],
  providers: [
    UserRepository,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class UserModule {}

// In service
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private userRepository: IUserRepository,
    private unitOfWork: UnitOfWork
  ) {}

  async createUser(userData: CreateUserDto): Promise<Result<User>> {
    await this.unitOfWork.begin();
    
    try {
      const userRepo = this.unitOfWork.getRepository(UserRepository);
      const result = await userRepo.create(userData);
      
      if (result.isFailure) {
        await this.unitOfWork.rollback();
        return result;
      }

      await this.unitOfWork.commit();
      return result;
    } catch (error) {
      await this.unitOfWork.rollback();
      return Result.fail(`User creation failed: ${error.message}`);
    }
  }
}
```

## Testing Strategy

```typescript
describe('UserRepository', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [InfrastructureModule.forRoot()],
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create and find user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const createResult = await repository.create(userData);
    expect(createResult.isSuccess).toBe(true);

    const findResult = await repository.findByEmail(userData.email);
    expect(findResult.isSuccess).toBe(true);
    expect(findResult.value?.email).toBe(userData.email);
  });
});
```

## Performance Considerations

1. **Connection Pooling** - Optimize database connections
2. **Query Optimization** - Use indexes and efficient queries
3. **Caching** - Implement query result caching
4. **Batch Operations** - Support bulk operations