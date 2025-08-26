import { SetMetadata } from '@nestjs/common';

export const QUEUE_PROCESSOR_KEY = 'queue_processor';

export interface ProcessorOptions {
  name: string;
  concurrency?: number;
  retryAttempts?: number;
}

export const QueueProcessor = (options: ProcessorOptions) => 
  SetMetadata(QUEUE_PROCESSOR_KEY, options);