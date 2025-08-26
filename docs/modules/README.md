# Module Creation Guide

## 🎯 Module Architecture

Each module follows Domain-Driven Design principles with clear separation of concerns:

```
module-name/
├── domain/
│   ├── entities/           # Business entities
│   ├── value-objects/      # Immutable value objects
│   ├── events/            # Domain events
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── application/
│   ├── commands/          # Command objects
│   ├── queries/           # Query objects
│   ├── handlers/          # Command/Query handlers
│   ├── services/          # Application services
│   └── dto/              # Data transfer objects
├── infrastructure/
│   ├── repositories/      # Repository implementations
│   ├── adapters/         # External service adapters
│   ├── persistence/      # Database models
│   └── config/           # Module configuration
└── presentation/
    ├── controllers/       # REST controllers
    ├── dto/              # API DTOs
    ├── guards/           # Authorization guards
    └── decorators/       # Custom decorators
```

## 🚀 Quick Module Creation

### Using CLI Generator

```bash
# Create complete module
npm run create:module order-management

# Create specific components
npm run create:entity Product order-management
npm run create:service OrderService order-management
npm run create:controller Order order-management
```

### Manual Module Creation

#### 1. Domain Layer

**Entity Example:**
```typescript
// domain/entities/order.entity.ts
import { AggregateRoot, Entity } from '@system/core';
import { OrderId, CustomerId, OrderStatus } from '../value-objects';
import { OrderCreatedEvent } from '../events';

export class Order extends AggregateRoot<OrderId> {
  private constructor(
    id: OrderId,
    private _customerId: CustomerId,
    private _items: OrderItem[],
    private _status: OrderStatus,
    private _createdAt: Date
  ) {
    super(id);
  }

  static create(props: CreateOrderProps): Result<Order> {
    const order = new Order(
      OrderId.generate(),
      props.customerId,
      props.items,
      OrderStatus.PENDING,
      new Date()
    );

    order.addDomainEvent(new OrderCreatedEvent(order.id, order._customerId));
    return Result.ok(order);
  }

  addItem(item: OrderItem): Result<void> {
    if (this._status !== OrderStatus.PENDING) {
      return Result.fail('Cannot modify confirmed order');
    }
    
    this._items.push(item);
    return Result.ok();
  }

  confirm(): Result<void> {
    if (this._items.length === 0) {
      return Result.fail('Cannot confirm empty order');
    }

    this._status = OrderStatus.CONFIRMED;
    this.addDomainEvent(new OrderConfirmedEvent(this.id));
    return Result.ok();
  }

  // Getters
  get customerId(): CustomerId { return this._customerId; }
  get items(): OrderItem[] { return [...this._items]; }
  get status(): OrderStatus { return this._status; }
  get total(): Money {
    return this._items.reduce((sum, item) => sum.add(item.total), Money.zero());
  }
}
```

**Value Object Example:**
```typescript
// domain/value-objects/order-id.ts
import { ValueObject } from '@system/core';

export class OrderId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Result<OrderId> {
    if (!value || value.trim().length === 0) {
      return Result.fail('OrderId cannot be empty');
    }

    return Result.ok(new OrderId(value));
  }

  static generate(): OrderId {
    return new OrderId(uuid());
  }
}
```

**Domain Event Example:**
```typescript
// domain/events/order-created.event.ts
import { DomainEvent } from '@system/core';

export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId
  ) {
    super();
  }
}
```

#### 2. Application Layer

**Command Example:**
```typescript
// application/commands/create-order.command.ts
export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: CreateOrderItemDto[]
  ) {}
}
```

**Command Handler Example:**
```typescript
// application/handlers/create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateOrderCommand): Promise<Result<OrderDto>> {
    const customerIdResult = CustomerId.create(command.customerId);
    if (customerIdResult.isFailure) {
      return Result.fail(customerIdResult.error);
    }

    const orderResult = Order.create({
      customerId: customerIdResult.getValue(),
      items: command.items.map(item => OrderItem.create(item))
    });

    if (orderResult.isFailure) {
      return Result.fail(orderResult.error);
    }

    const order = orderResult.getValue();
    await this.orderRepository.save(order);

    // Publish events
    for (const event of order.domainEvents) {
      await this.eventBus.publish(event);
    }
    order.clearEvents();

    return Result.ok(OrderMapper.toDto(order));
  }
}
```

#### 3. Infrastructure Layer

**Repository Implementation:**
```typescript
// infrastructure/repositories/order.repository.ts
@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    const data = OrderMapper.toPersistence(order);
    
    await this.prisma.order.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const orderData = await this.prisma.order.findUnique({
      where: { id: id.value },
      include: { items: true }
    });

    return orderData ? OrderMapper.toDomain(orderData) : null;
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId: customerId.value },
      include: { items: true }
    });

    return orders.map(OrderMapper.toDomain);
  }
}
```

#### 4. Presentation Layer

**Controller Example:**
```typescript
// presentation/controllers/order.controller.ts
@Controller('orders')
@ApiTags('Orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, type: OrderDto })
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    const command = new CreateOrderCommand(dto.customerId, dto.items);
    const result = await this.commandBus.execute(command);
    
    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    
    return result.getValue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrder(@Param('id') id: string): Promise<OrderDto> {
    const query = new GetOrderQuery(id);
    const result = await this.queryBus.execute(query);
    
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }
    
    return result.getValue();
  }
}
```

## 📋 Module Checklist

### Domain Layer ✅
- [ ] Entities with business logic
- [ ] Value objects for data validation
- [ ] Domain events for side effects
- [ ] Repository interfaces
- [ ] Domain services for complex operations

### Application Layer ✅
- [ ] Commands for write operations
- [ ] Queries for read operations
- [ ] Command/Query handlers
- [ ] Application services
- [ ] DTOs for data transfer

### Infrastructure Layer ✅
- [ ] Repository implementations
- [ ] External service adapters
- [ ] Database models/schemas
- [ ] Configuration files

### Presentation Layer ✅
- [ ] REST controllers
- [ ] API DTOs with validation
- [ ] Guards for authorization
- [ ] Swagger documentation

### Testing ✅
- [ ] Unit tests for entities
- [ ] Integration tests for repositories
- [ ] E2E tests for controllers
- [ ] Test fixtures and mocks

## 🔧 Module Configuration

### Module Registration

```typescript
// order-management.module.ts
@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    RedisModule
  ],
  controllers: [OrderController],
  providers: [
    // Command Handlers
    CreateOrderHandler,
    UpdateOrderHandler,
    
    // Query Handlers
    GetOrderHandler,
    GetOrdersHandler,
    
    // Repositories
    { provide: OrderRepository, useClass: PrismaOrderRepository },
    
    // Services
    OrderService
  ],
  exports: [OrderRepository, OrderService]
})
export class OrderManagementModule {}
```

### Environment Configuration

```typescript
// config/order.config.ts
export const orderConfig = registerAs('order', () => ({
  maxItemsPerOrder: parseInt(process.env.MAX_ITEMS_PER_ORDER, 10) || 50,
  orderTimeout: parseInt(process.env.ORDER_TIMEOUT, 10) || 3600,
  paymentGateway: {
    url: process.env.PAYMENT_GATEWAY_URL,
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY
  }
}));
```