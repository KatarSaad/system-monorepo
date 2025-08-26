export * from './services/ticket.service';
export * from './interfaces/ticket.interface';
export * from './tickets.module';

// Re-exports
export { TicketService } from './services/ticket.service';
export { TicketsModule } from './tickets.module';
export type { Ticket, TicketStatus, TicketPriority, TicketFilter, TicketStats } from './interfaces/ticket.interface';