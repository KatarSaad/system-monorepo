# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Environment Setup
```bash
# Clone and install
git clone <repository>
cd system
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure
docker-compose up -d

# Initialize database
npm run db:migrate
npm run db:seed
```

### 2. Create Your First Module
```bash
# Generate user management module
npm run create:module user-management

# This creates complete DDD structure:
# - Domain layer (entities, value objects, events)
# - Application layer (commands, queries, handlers)
# - Infrastructure layer (repositories, adapters)
# - Presentation layer (controllers, DTOs)
```

### 3. Implement Business Logic
```typescript
// domain/entities/user.entity.ts
import { AggregateRoot, Result } from '@system/core';

export class User extends AggregateRoot<UserId> {
  static create(props: CreateUserProps): Result<User> {
    // Validation and business rules
    const user = new User(UserId.generate(), props.email, props.profile);
    user.addDomainEvent(new UserCreatedEvent(user.id));
    return Result.ok(user);
  }
}

// application/services/user.service.ts
import { BaseService, Result } from '@system/core';

export class UserService extends BaseService {
  constructor() { super('UserService'); }

  async createUser(command: CreateUserCommand): Promise<Result<UserDto>> {
    return this.executeWithLogging('createUser', async () => {
      const userResult = User.create(command);
      if (userResult.isFailure) return userResult;
      
      const user = userResult.getValue();
      await this.userRepository.save(user);
      
      return UserMapper.toDto(user);
    }, { email: command.email });
  }
}
```

### 4. Add API Endpoints
```typescript
// presentation/controllers/user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponseDto } from '@system/core';

@Controller('users')
export class UserController {
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<ApiResponseDto<UserDto>> {
    const command = new CreateUserCommand(dto.email, dto.profile);
    const result = await this.userService.createUser(command);
    
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    
    return ApiResponseDto.success(result.getValue(), 'User created successfully');
  }
}
```

### 5. Start Development
```bash
# Start development server
npm run dev

# Your API is now available at:
# http://localhost:3000/api/users

# Swagger documentation at:
# http://localhost:3000/api/docs
```

## 📋 Common Usage Patterns

### Using Core Utilities
```typescript
import { StringUtils, ObjectUtils, Result } from '@system/core';

// String manipulation
const slug = StringUtils.slugify('Product Name'); // 'product-name'
const masked = StringUtils.mask('1234567890', 4); // '******7890'

// Object operations
const cleaned = ObjectUtils.removeUndefined(data);
const picked = ObjectUtils.pick(user, ['id', 'email']);

// Error handling
const result = await someOperation();
if (result.isSuccess) {
  console.log(result.getValue());
} else {
  console.error(result.error);
}
```

### Adding Caching
```typescript
import { CacheDecorator } from '@system/core';

class UserService {
  @CacheDecorator.cache({ ttl: 300 }) // 5 minutes
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}
```

### Adding Retry Logic
```typescript
import { Retry, RetryConditions } from '@system/core';

class ExternalApiService {
  @Retry({
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: RetryConditions.networkError
  })
  async fetchData(): Promise<any> {
    return this.httpClient.get('/api/data');
  }
}
```

### Event Handling
```typescript
// Publish domain events
user.addDomainEvent(new UserCreatedEvent(user.id));

// Handle events
@EventHandler(UserCreatedEvent)
export class SendWelcomeEmailHandler {
  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(event.userId);
  }
}
```

## 🧪 Testing Your Code

### Unit Tests
```typescript
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
```

### Integration Tests
```typescript
describe('UserService Integration', () => {
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
  });

  it('should create user successfully', async () => {
    const command = new CreateUserCommand('test@example.com', profile);
    const result = await service.createUser(command);
    
    expect(result.isSuccess).toBe(true);
  });
});
```

## 🔧 Development Commands

```bash
# Package management
npm run build:packages          # Build all packages
npm run test:packages          # Test all packages

# Module generation
npm run create:module <name>    # Create new module
npm run create:service <name>   # Create new service
npm run create:entity <name>    # Create new entity

# Development
npm run dev                    # Start development server
npm run test                   # Run all tests
npm run test:watch            # Run tests in watch mode
npm run lint                  # Lint code
npm run lint:fix             # Fix linting issues

# Database
npm run db:migrate           # Run database migrations
npm run db:seed             # Seed database with test data
npm run db:studio           # Open Prisma Studio

# Docker
npm run docker:up           # Start infrastructure services
npm run docker:down         # Stop infrastructure services
```

## 📚 Next Steps

1. **Read the Architecture Guide** - Understand DDD principles and system design
2. **Explore Package Documentation** - Learn about core, shared, and infrastructure packages
3. **Check Examples** - Look at existing modules for patterns and best practices
4. **Set Up Monitoring** - Configure logging, metrics, and health checks
5. **Deploy to Staging** - Test your application in a production-like environment

## 🆘 Common Issues

### Module Not Found
```bash
# Rebuild packages
npm run build:packages

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Reset database
docker-compose down
docker-compose up -d postgres
npm run db:migrate
```

### Port Already in Use
```bash
# Change port in .env file
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

You're now ready to build enterprise-grade applications with our modular system! 🎉