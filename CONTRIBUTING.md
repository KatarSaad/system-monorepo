# 🤝 Contributing to System Monorepo

Thank you for your interest in contributing to the System Monorepo! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Git
- Docker (optional)

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/system-monorepo.git
   cd system-monorepo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Workflow Steps

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(core): add user authentication service
fix(validation): resolve email validation issue
docs(readme): update installation instructions
test(user): add unit tests for user service
```

## 📝 Coding Standards

### TypeScript Guidelines

1. **Use TypeScript strictly**
   ```typescript
   // ✅ Good
   interface User {
     id: string;
     email: string;
     name: string;
   }

   // ❌ Bad
   const user: any = { ... };
   ```

2. **Prefer interfaces over types**
   ```typescript
   // ✅ Good
   interface UserConfig {
     timeout: number;
     retries: number;
   }

   // ❌ Bad
   type UserConfig = {
     timeout: number;
     retries: number;
   };
   ```

3. **Use meaningful names**
   ```typescript
   // ✅ Good
   const getUserById = (id: string) => { ... };

   // ❌ Bad
   const getUser = (x: string) => { ... };
   ```

### NestJS Patterns

1. **Use dependency injection**
   ```typescript
   @Injectable()
   export class UserService {
     constructor(
       private readonly userRepository: UserRepository,
       private readonly logger: Logger,
     ) {}
   }
   ```

2. **Follow module structure**
   ```typescript
   @Module({
     imports: [TypeOrmModule.forFeature([User])],
     providers: [UserService],
     controllers: [UserController],
     exports: [UserService],
   })
   export class UserModule {}
   ```

3. **Use decorators appropriately**
   ```typescript
   @Controller('users')
   @ApiTags('Users')
   export class UserController {
     @Get(':id')
     @ApiOperation({ summary: 'Get user by ID' })
     async findOne(@Param('id') id: string) {
       return this.userService.findById(id);
     }
   }
   ```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

**Key Rules:**
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas
- Max line length: 100 characters
- Use semicolons

## 🧪 Testing Guidelines

### Test Structure
```
src/
├── user/
│   ├── user.service.ts
│   ├── user.service.spec.ts     # Unit tests
│   ├── user.controller.ts
│   └── user.controller.spec.ts
└── test/
    ├── user.e2e-spec.ts         # E2E tests
    └── fixtures/
        └── user.fixtures.ts      # Test data
```

### Unit Tests
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: '1', email: 'test@example.com' };
      repository.findOne.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw error when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow('User not found');
    });
  });
});
```

### Integration Tests
```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe('test@example.com');
      });
  });
});
```

### Test Coverage
- Minimum 80% code coverage
- All public methods must be tested
- Critical business logic requires 100% coverage

```bash
# Run tests with coverage
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html
```

## 📚 Documentation

### Code Documentation
```typescript
/**
 * Creates a new user in the system
 * @param userData - The user data to create
 * @returns Promise resolving to the created user
 * @throws UserAlreadyExistsError when email is already taken
 * @example
 * ```typescript
 * const user = await userService.create({
 *   email: 'john@example.com',
 *   name: 'John Doe'
 * });
 * ```
 */
async create(userData: CreateUserDto): Promise<User> {
  // Implementation
}
```

### README Updates
- Update package README when adding features
- Include code examples
- Update API documentation
- Add migration notes for breaking changes

### API Documentation
- Use Swagger decorators
- Provide request/response examples
- Document error responses
- Include authentication requirements

## 🔍 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process
1. **Automated Checks** - CI/CD pipeline runs
2. **Code Review** - At least one maintainer reviews
3. **Testing** - All tests must pass
4. **Approval** - Maintainer approves changes
5. **Merge** - Squash and merge to main

## 🐛 Issue Reporting

### Bug Reports
Use the bug report template:

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.17.0]
- Package version: [e.g. 1.2.3]

**Additional context**
Any other context about the problem
```

### Feature Requests
Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Alternative solutions or features considered

**Additional context**
Any other context or screenshots
```

## 🏷️ Package Development

### Creating New Packages
```bash
# Generate package structure
npm run create:package my-new-package

# Follow package template
# - Add proper exports
# - Include comprehensive tests
# - Write documentation
# - Add to monorepo dependencies
```

### Package Guidelines
- Follow semantic versioning
- Maintain backward compatibility
- Include comprehensive README
- Add proper TypeScript types
- Include usage examples

## 🚀 Release Process

### Version Management
- Use semantic versioning (semver)
- Update CHANGELOG.md
- Tag releases properly
- Publish to npm registry

### Release Steps
1. Update version numbers
2. Update CHANGELOG.md
3. Create release PR
4. Merge to main
5. Create GitHub release
6. Publish packages

## 🤔 Questions?

- **General Questions**: [GitHub Discussions](https://github.com/KatarSaad/system-monorepo/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/KatarSaad/system-monorepo/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/KatarSaad/system-monorepo/issues)
- **Chat**: [Discord Community](https://discord.gg/system)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

Thank you for contributing to System Monorepo! 🎉