export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  reporterId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  dueDate?: Date;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TicketFilter {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assigneeId?: string;
  reporterId?: string;
  tags?: string[];
  dateRange?: { from: Date; to: Date };
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  averageResolutionTime?: number;
  slaCompliance?: number;
}

export interface TicketWorkflow {
  from: TicketStatus;
  to: TicketStatus;
  conditions?: (ticket: Ticket) => boolean;
  actions?: (ticket: Ticket) => Promise<void>;
}