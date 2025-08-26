import { Injectable } from '@nestjs/common';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  service?: string;
  operation?: string;
  [key: string]: any;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggingService {
  private context: LogContext = {};

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, { ...context, error: error?.stack });
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  public log(level: LogLevel, message: string, context?: LogContext): void;
  public log(logData: any): void;
  public log(levelOrData: any, message?: string, context?: LogContext): void {
    if (typeof levelOrData === 'object') {
      // Handle object-style logging
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...this.context,
        ...levelOrData,
      };
      console.log(JSON.stringify(logEntry));
    } else {
      // Handle traditional logging
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: levelOrData,
        message,
        ...this.context,
        ...context,
      };
      console.log(JSON.stringify(logEntry));
    }
  }
}