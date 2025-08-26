# Development Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Redis
- PostgreSQL

### Initial Setup

```bash
# Clone and setup
git clone <repository>
cd system
npm install

# Setup environment
cp .env.example .env
docker-compose up -d

# Initialize database
npm run db:migrate
npm run db:seed

# Start development
npm run dev
```

## 📦 Package Management

### Workspace Structure

```json
{
  "name": "enterprise-system",
  "workspaces": [
    "packages/*",
    "services/*"
  ]
}
```

### Core Packages

#### @system/core
```bash
cd packages/core
npm run build
npm run test
```

#### @system/shared
```bash
cd packages/shared
npm run build
npm run test
```

#### @system/infrastructure
```bash
cd packages/infrastructure
npm run build
npm run test
```

## 🏗️ Module Development

### Creating a New Module

```bash
# Generate module scaffold
npm run create:module user-management

# This creates:
# - Domain layer (entities, value objects, events)
# - Application layer (commands, queries, handlers)
# - Infrastructure layer (repositories, adapters)
# - Presentation layer (controllers, DTOs)
```

### Module Template Structure

```typescript
// src/modules/user-management/domain/entities/user.entity.ts
import { AggregateRoot, Entity } from '@system/core';

export class User extends AggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private _email: Email,
    private _profile: UserProfile
  ) {
    super(id);
  }

  static create(props: CreateUserProps): Result<User> {
    const emailResult = Email.create(props.email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.error);
    }

    const user = new User(
      UserId.generate(),
      emailResult.getValue(),
      UserProfile.create(props.profile)
    );

    user.addDomainEvent(new UserCreatedEvent(user.id));
    return Result.ok(user);
  }
}
```

### Application Service Pattern

```typescript
// src/modules/user-management/application/services/user.service.ts
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async createUser(command: CreateUserCommand): Promise<Result<UserDto>> {
    try {
      const userResult = User.create({
        email: command.email,
        profile: command.profile
      });

      if (userResult.isFailure) {
        return Result.fail(userResult.error);
      }

      const user = userResult.getValue();
      await this.userRepository.save(user);

      // Publish domain events
      for (const event of user.domainEvents) {
        await this.eventBus.publish(event);
      }
      user.clearEvents();

      return Result.ok(UserMapper.toDto(user));
    } catch (error) {
      this.logger.error('Failed to create user', error);
      return Result.fail('User creation failed');
    }
  }
}
```

## 🔧 Development Tools

### Code Generation

```bash
# Generate entity
npm run generate:entity User user-management

# Generate value object
npm run generate:value-object Email shared

# Generate repository
npm run generate:repository User user-management

# Generate controller
npm run generate:controller User user-management
```

### Testing Strategy

```typescript
// Unit Test Example
describe('User Entity', () => {
  it('should create user with valid data', () => {
    const result = User.create({
      email: 'test@example.com',
      profile: { firstName: 'John', lastName: 'Doe' }
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().email.value).toBe('test@example.com');
  });
});

// Integration Test Example
describe('UserService', () => {
  let service: UserService;
  let repository: MockUserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useClass: MockUserRepository }
      ]
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<MockUserRepository>(UserRepository);
  });
});
```

## 📊 Monitoring & Debugging

### Logging Configuration

```typescript
// logger.config.ts
export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
};
```

### Health Checks

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: Redis
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory()
    ]);

    return {
      status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: checks.map(this.mapCheckResult)
    };
  }
}
```

## 🔄 Development Workflow

### Git Workflow

```bash
# Feature development
git checkout -b feature/user-management
git commit -m "feat(user): add user creation"
git push origin feature/user-management

# Code review and merge
# Automated tests run on PR
# Merge to main triggers deployment
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
```