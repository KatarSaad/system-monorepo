# Schema-Agnostic Ticket System Usage

## 🎯 Key Innovation: Schema Independence

The ticket system is designed to work with ANY database schema through field mapping configuration.

## 🏗️ Architecture Overview

### Phase 1: Enhanced Infrastructure ✅
- **BaseDomainService**: Schema-agnostic base class
- **Field Mapping**: Logical fields → Schema fields
- **Dynamic Repository**: Works with any table structure

### Phase 2: Ticket System ✅
- **TicketService**: Full enterprise ticket management
- **Configurable Schema**: Adapts to existing tables
- **Workflow Engine**: Status transitions with validation
- **Audit Integration**: Complete change tracking

## 🚀 Usage Examples

### 1. Basic Setup (Default Schema)

```typescript
// app.module.ts
@Module({
  imports: [
    TicketsModule.forRoot({
      enableMetrics: true,
      enableAudit: true,
      global: true
    })
  ]
})
export class AppModule {}

// tickets.controller.ts
@Controller('tickets')
export class TicketsController {
  constructor(private ticketService: TicketService) {}

  @Post()
  async createTicket(@Body() data: CreateTicketDto) {
    const result = await this.ticketService.createTicket({
      title: data.title,
      description: data.description,
      priority: data.priority,
      reporterId: data.reporterId,
      tags: data.tags || []
    });

    if (!result.isSuccess) {
      throw new BadRequestException(result.error);
    }

    return result.value;
  }

  @Get('stats')
  async getStats(@Query() filter: TicketFilterDto) {
    const result = await this.ticketService.getTicketStats(filter);
    return result.isSuccess ? result.value : null;
  }
}
```

### 2. Custom Schema Configuration

```typescript
// For existing database with different field names
@Module({
  imports: [
    TicketsModule.forRoot({
      enableMetrics: true,
      enableAudit: true,
      schemaConfig: {
        modelName: 'support_requests', // Your existing table
        fieldMapping: {
          'id': 'request_id',
          'title': 'subject',
          'description': 'body',
          'status': 'current_status',
          'priority': 'urgency_level',
          'assigneeId': 'assigned_to_user_id',
          'reporterId': 'created_by_user_id',
          'createdAt': 'date_created',
          'updatedAt': 'last_modified'
        }
      }
    })
  ]
})
export class AppModule {}
```

### 3. Advanced Operations

```typescript
@Injectable()
export class TicketManagementService {
  constructor(private ticketService: TicketService) {}

  async assignHighPriorityTickets(assigneeId: string) {
    // Filter high priority unassigned tickets
    const result = await this.ticketService.filterTickets({
      priority: [TicketPriority.HIGH, TicketPriority.CRITICAL],
      status: [TicketStatus.OPEN]
    });

    if (result.isSuccess) {
      // Bulk assign tickets
      const ticketIds = result.value.data.map(t => t.id);
      await this.ticketService.bulkUpdateStatus(
        ticketIds, 
        TicketStatus.IN_PROGRESS, 
        assigneeId
      );
    }
  }

  async generateSLAReport() {
    const stats = await this.ticketService.getTicketStats({
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    });

    if (stats.isSuccess) {
      return {
        totalTickets: stats.value.total,
        averageResolutionTime: stats.value.averageResolutionTime,
        statusBreakdown: stats.value.byStatus,
        priorityBreakdown: stats.value.byPriority
      };
    }
  }

  async escalateOverdueTickets() {
    const overdueResult = await this.ticketService.getOverdueTickets();
    
    if (overdueResult.isSuccess) {
      for (const ticket of overdueResult.value) {
        if (ticket.priority !== TicketPriority.CRITICAL) {
          await this.ticketService.update(ticket.id, {
            priority: TicketPriority.HIGH
          });
        }
      }
    }
  }
}
```

## 🔧 Schema Flexibility Examples

### Example 1: E-commerce Orders as Tickets
```typescript
TicketsModule.forRoot({
  schemaConfig: {
    modelName: 'orders',
    fieldMapping: {
      'id': 'order_id',
      'title': 'order_number',
      'description': 'notes',
      'status': 'order_status',
      'priority': 'urgency',
      'assigneeId': 'fulfillment_agent_id',
      'reporterId': 'customer_id',
      'createdAt': 'order_date'
    }
  }
})
```

### Example 2: HR Requests as Tickets
```typescript
TicketsModule.forRoot({
  schemaConfig: {
    modelName: 'hr_requests',
    fieldMapping: {
      'id': 'request_id',
      'title': 'request_type',
      'description': 'details',
      'status': 'approval_status',
      'priority': 'importance',
      'assigneeId': 'hr_representative_id',
      'reporterId': 'employee_id'
    }
  }
})
```

## 📊 Built-in Features

### 1. Workflow Management
- ✅ Status transition validation
- ✅ Configurable workflows
- ✅ Automatic audit logging

### 2. Advanced Filtering
- ✅ Multi-field filtering
- ✅ Date range queries
- ✅ Tag-based filtering
- ✅ Pagination support

### 3. Analytics & Reporting
- ✅ Real-time statistics
- ✅ Resolution time tracking
- ✅ SLA compliance monitoring
- ✅ Performance metrics

### 4. Search Capabilities
- ✅ Full-text search across configurable fields
- ✅ Fuzzy matching
- ✅ Result ranking

### 5. Bulk Operations
- ✅ Bulk status updates
- ✅ Bulk assignments
- ✅ Transaction support

## 🎯 Benefits

### Schema Independence
- ✅ Works with ANY existing database schema
- ✅ No database migrations required
- ✅ Configurable field mappings

### Enterprise Features
- ✅ Complete audit trail
- ✅ Performance monitoring
- ✅ Workflow validation
- ✅ SLA tracking

### Developer Experience
- ✅ Type-safe operations
- ✅ Result pattern for error handling
- ✅ Comprehensive logging
- ✅ Easy testing

### Scalability
- ✅ Optimized queries with proper indexing
- ✅ Bulk operations support
- ✅ Caching integration
- ✅ Metrics collection

## 🚀 Next Steps

1. **Add to existing schema**: Copy ticket models to your Prisma schema
2. **Configure module**: Set up field mappings for your schema
3. **Implement controllers**: Create REST/GraphQL endpoints
4. **Add business logic**: Extend with custom workflows
5. **Monitor performance**: Use built-in metrics and logging

This approach provides a production-ready, enterprise-scale ticket system that adapts to any database schema while maintaining full functionality and performance.