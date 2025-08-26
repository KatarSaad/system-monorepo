export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  correlationId?: string;
  service?: string;
}

export interface LoggerAdapter {
  log(entry: LogEntry): void;
}

export class Logger {
  private static adapters: LoggerAdapter[] = [];
  private static globalContext: Record<string, any> = {};
  private static minLevel: LogLevel = LogLevel.INFO;

  constructor(private readonly service?: string) {}

  static addAdapter(adapter: LoggerAdapter): void {
    this.adapters.push(adapter);
  }

  static setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  static setGlobalContext(context: Record<string, any>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.TRACE, message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level > Logger.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: { ...Logger.globalContext, ...context },
      service: this.service
    };

    Logger.adapters.forEach(adapter => adapter.log(entry));
  }
}

export class ConsoleLoggerAdapter implements LoggerAdapter {
  private readonly colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[35m', // Magenta
    TRACE: '\x1b[37m', // White
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m',
    DIM: '\x1b[2m',
  };

  log(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const color = this.colors[levelName as keyof typeof this.colors] || this.colors.RESET;
    const timestamp = entry.timestamp.toLocaleString();
    const service = entry.service ? `${this.colors.BOLD}[${entry.service}]${this.colors.RESET}` : '';
    
    let contextStr = '';
    if (entry.context && Object.keys(entry.context).length > 0) {
      contextStr = `\n${this.colors.DIM}${JSON.stringify(entry.context, null, 2)}${this.colors.RESET}`;
    }
    
    const logMessage = `${this.colors.DIM}${timestamp}${this.colors.RESET} ${color}${levelName.padEnd(5)}${this.colors.RESET} ${service} ${entry.message}${contextStr}`;
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}

export class FileLoggerAdapter implements LoggerAdapter {
  constructor(private readonly filePath: string) {}

  log(entry: LogEntry): void {
    // Implementation would write to file
    // This is a placeholder for the interface
  }
}

// Initialize with console adapter by default
Logger.addAdapter(new ConsoleLoggerAdapter());