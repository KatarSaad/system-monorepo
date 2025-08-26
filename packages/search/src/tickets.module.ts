import { Module, DynamicModule } from '@nestjs/common';
import { InfrastructureModule } from '@system/infrastructure';
import { CoreModule } from '@system/core';
import { MonitoringModule } from '@system/monitoring';
import { AuditModule } from '@system/audit';
import { TicketService } from './services/ticket.service';

export interface TicketModuleOptions {
  global?: boolean;
  enableMetrics?: boolean;
  enableAudit?: boolean;
  schemaConfig?: {
    modelName?: string;
    fieldMapping?: Record<string, string>;
  };
}

@Module({})
export class TicketsModule {
  static forRoot(options: TicketModuleOptions = {}): DynamicModule {
    const imports = [
      InfrastructureModule,
      CoreModule
    ];

    if (options.enableMetrics) {
      imports.push(MonitoringModule);
    }

    if (options.enableAudit) {
      imports.push(AuditModule);
    }

    let TicketServiceProvider = TicketService;
    
    // Configure for different schemas
    if (options.schemaConfig) {
      TicketServiceProvider = TicketService.forSchema({
        modelName: options.schemaConfig.modelName || 'ticket',
        fieldMapping: options.schemaConfig.fieldMapping || {},
        searchFields: ['title', 'description', 'tags'],
        sortableFields: ['createdAt', 'updatedAt', 'priority', 'status'],
        filterableFields: ['status', 'priority', 'assigneeId', 'reporterId']
      });
    }

    return {
      module: TicketsModule,
      imports,
      providers: [TicketServiceProvider],
      exports: [TicketServiceProvider],
      global: options.global || false
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: TicketsModule,
      providers: [TicketService],
      exports: [TicketService]
    };
  }
}