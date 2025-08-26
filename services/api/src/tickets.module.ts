import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaTicketService, TicketService } from '@katarsaad/core';
import { TicketsController } from './tickets.controller';

@Module({
  controllers: [TicketsController],
  providers: [
    {
      provide: 'PRISMA_CLIENT',
      useValue: new PrismaClient()
    },
    {
      provide: TicketService,
      useFactory: (prisma: any) => new PrismaTicketService(prisma),
      inject: ['PRISMA_CLIENT']
    }
  ],
  exports: [TicketService]
})
export class TicketsModule {}