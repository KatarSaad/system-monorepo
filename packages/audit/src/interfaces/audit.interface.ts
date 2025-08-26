export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT';
  resource: string;
  resourceId: string;
  userId: string;
  data?: any;
  metadata?: Record<string, any>;
}