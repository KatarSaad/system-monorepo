import { Entity } from './entity';

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

export interface TicketProps {
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

export class TicketEntity extends Entity<TicketProps> {
  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TicketStatus {
    return this.props.status;
  }

  get priority(): TicketPriority {
    return this.props.priority;
  }

  get assigneeId(): string | undefined {
    return this.props.assigneeId;
  }

  get reporterId(): string {
    return this.props.reporterId;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get resolvedAt(): Date | undefined {
    return this.props.resolvedAt;
  }

  get dueDate(): Date | undefined {
    return this.props.dueDate;
  }

  assign(assigneeId: string): void {
    this.props.assigneeId = assigneeId;
    this.props.status = TicketStatus.IN_PROGRESS;
    this.props.updatedAt = new Date();
  }

  updateStatus(status: TicketStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
    
    if (status === TicketStatus.RESOLVED) {
      this.props.resolvedAt = new Date();
    }
  }

  isOverdue(): boolean {
    if (!this.props.dueDate) return false;
    return new Date() > this.props.dueDate && 
           ![TicketStatus.RESOLVED, TicketStatus.CLOSED].includes(this.props.status);
  }

  canTransitionTo(newStatus: TicketStatus): boolean {
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.OPEN],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.REOPENED],
      [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
      [TicketStatus.REOPENED]: [TicketStatus.IN_PROGRESS]
    };

    const currentStatus = this.props.status;
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  static create(props: Omit<TicketProps, 'id' | 'createdAt' | 'updatedAt' | 'status'>, id?: string): TicketEntity {
    const now = new Date();
    return new TicketEntity({
      ...props,
      status: TicketStatus.OPEN,
      createdAt: now,
      updatedAt: now
    }, id);
  }
}