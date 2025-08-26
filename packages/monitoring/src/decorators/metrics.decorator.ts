import { SetMetadata } from '@nestjs/common';

export const METRICS_KEY = 'metrics';

export interface MetricsOptions {
  name?: string;
  labels?: Record<string, string>;
  timing?: boolean;
  counter?: boolean;
}

export const Metrics = (options: MetricsOptions = {}) => SetMetadata(METRICS_KEY, options);