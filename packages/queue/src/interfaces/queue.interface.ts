export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: BackoffStrategy;
}

export interface BackoffStrategy {
  type: 'fixed' | 'exponential';
  delay: number;
}

export interface QueueOptions {
  concurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
  removeOnComplete?: number;
  removeOnFail?: number;
}

export interface JobProcessor<T = any> {
  process(job: QueueJob<T>): Promise<any>;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}