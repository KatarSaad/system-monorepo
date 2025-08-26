import { SetMetadata } from '@nestjs/common';

export const FEATURE_FLAG_KEY = 'feature_flag';

export interface FeatureFlagOptions {
  flag: string;
  fallback?: boolean;
  variant?: string;
}

export const FeatureFlag = (options: FeatureFlagOptions) => 
  SetMetadata(FEATURE_FLAG_KEY, options);