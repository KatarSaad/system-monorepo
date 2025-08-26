import { Logger } from '../common/logger';
import { Result } from '../common/result';

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  protected async executeWithLogging<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<Result<T>> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting ${operation}`, context);
      
      const result = await fn();
      
      const duration = Date.now() - startTime;
      this.logger.info(`Completed ${operation}`, { ...context, duration });
      
      return Result.ok(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed ${operation}`, { ...context, duration, error });
      
      return Result.fail(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  protected validateInput<T>(input: T, validator: (input: T) => string[]): Result<T> {
    const errors = validator(input);
    
    if (errors.length > 0) {
      return Result.fail(`Validation failed: ${errors.join(', ')}`);
    }
    
    return Result.ok(input);
  }

  protected async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { error: lastError.message });
        await this.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}