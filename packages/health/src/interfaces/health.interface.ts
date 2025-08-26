export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  duration?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
  DEGRADED = 'degraded'
}

export interface HealthIndicator {
  name: string;
  check(): Promise<HealthCheck>;
}

export interface HealthReport {
  status: HealthStatus;
  checks: HealthCheck[];
  uptime: number;
  timestamp: Date;
}