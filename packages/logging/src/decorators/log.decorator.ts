import { LogLevel } from '../interfaces/logging.interface';

export interface LogOptions {
  level?: LogLevel;
  maskParams?: string[];
  logResult?: boolean;
  logError?: boolean;
}

export function Log(options: LogOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = (this as any).logger || console;
      const level = options.level || LogLevel.INFO;
      const context = target.constructor.name;

      // Log method entry
      const maskedArgs = options.maskParams 
        ? args.map((arg, index) => 
            options.maskParams!.includes(index.toString()) ? '***' : arg
          )
        : args;

      logger[level](`[${context}] ${propertyKey} called with args:`, maskedArgs);

      try {
        const result = await originalMethod.apply(this, args);
        
        if (options.logResult !== false) {
          logger[level](`[${context}] ${propertyKey} completed successfully`);
        }
        
        return result;
      } catch (error) {
        if (options.logError !== false) {
          logger.error(`[${context}] ${propertyKey} failed:`, error);
        }
        throw error;
      }
    };

    return descriptor;
  };
}