# System Packages

Enterprise-grade modular packages following the Software Behavior Manifesto principles.

## 📦 Available Packages

### Core Packages
- **@system/core** - Essential building blocks, domain primitives, and common patterns
- **@system/infrastructure** - Database adapters, repositories, and external integrations
- **@system/events** - Event-driven architecture with event bus and message queues
- **@system/logging** - Structured logging with multiple adapters (Winston, Pino)

### Feature Packages
- **@system/security** - Encryption, authentication, and security utilities
- **@system/validation** - Input validation, schemas, and custom validators
- **@system/monitoring** - Metrics collection, health checks, and observability
- **@system/system-module** - Main orchestration module that imports all packages

### Utility Packages
- **@system/shared** - Shared utilities and helper functions
- **@system/testing** - Testing utilities and mocks
- **@system/config** - Configuration management
- **@system/notifications** - Notification services
- **@system/queue** - Queue management
- **@system/search** - Search functionality
- **@system/rate-limiting** - Rate limiting and throttling
- **@system/health** - Health check services
- **@system/file-storage** - File storage abstractions
- **@system/feature-flags** - Feature flag management
- **@system/backup** - Backup and restore utilities
- **@system/audit** - Audit logging and compliance

## 🚀 Quick Start

### Using Individual Packages
```typescript
import { BaseService, Result, Logger } from '@system/core';
import { EventBusService } from '@system/events';
import { LoggingService } from '@system/logging';
```

### Using System Module (Recommended)
```typescript
import { SystemModule } from '@system/system-module';

@Module({
  imports: [SystemModule],
})
export class AppModule {}
```

## 🏗️ Architecture Principles

Each package follows these principles:
- **Single Responsibility** - One clear purpose
- **Zero Dependencies** between business packages
- **NestJS Integration** - Full framework support
- **TypeScript First** - Complete type safety
- **Testable** - Easy to mock and test
- **Configurable** - Environment-aware settings
- **Observable** - Built-in monitoring and logging

## 📋 Package Standards

Every package includes:
- ✅ NestJS Module
- ✅ Complete TypeScript types
- ✅ Comprehensive exports
- ✅ Documentation
- ✅ Configuration options
- ✅ Error handling
- ✅ Logging integration

## 🔧 Development

### Building All Packages
```bash
npm run build:packages
```

### Testing All Packages
```bash
npm run test:packages
```

### Linting All Packages
```bash
npm run lint:packages
```

## 📚 Documentation

Each package contains detailed documentation in its README.md file with:
- Purpose and scope
- Installation instructions
- Usage examples
- API reference
- Configuration options
- Best practices