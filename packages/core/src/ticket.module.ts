import { Module, DynamicModule } from '@nestjs/common';
import { PrismaTicketService, IPrismaClient } from './services/prisma-ticket.service';
import { TicketService } from './services/ticket.service';

export interface TicketModuleOptions {
  global?: boolean;
  prismaClient?: any;
}

@Module({})
export class TicketModule {
  static forRoot(options: TicketModuleOptions = {}): DynamicModule {
    const providers = [];
    
    if (options.prismaClient) {
      providers.push(
        {
          provide: 'PRISMA_CLIENT',
          useValue: options.prismaClient
        },
        {
          provide: TicketService,
          useFactory: (prisma: IPrismaClient) => new PrismaTicketService(prisma),
          inject: ['PRISMA_CLIENT']
        }
      );
    }

    return {
      module: TicketModule,
      providers,
      exports: [TicketService],
      global: options.global || false
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: TicketModule,
      providers: [PrismaTicketService],
      exports: [PrismaTicketService]
    };
  }
}