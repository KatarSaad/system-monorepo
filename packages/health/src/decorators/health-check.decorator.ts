import { SetMetadata } from '@nestjs/common';

export const HEALTH_CHECK_KEY = 'health_check';

export interface HealthCheckOptions {
  name: string;
  timeout?: number;
  interval?: number;
  critical?: boolean;
}

export const HealthCheckDecorator = (options: HealthCheckOptions) => 
  SetMetadata(HEALTH_CHECK_KEY, options);