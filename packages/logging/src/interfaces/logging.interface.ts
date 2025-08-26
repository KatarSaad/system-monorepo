export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface LoggerAdapter {
  log(entry: LogEntry): void;
  error(message: string, trace?: string, context?: string): void;
  warn(message: string, context?: string): void;
  info(message: string, context?: string): void;
  debug(message: string, context?: string): void;
}