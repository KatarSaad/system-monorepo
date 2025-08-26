export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetingRules?: TargetingRule[];
  variants?: FlagVariant[];
}

export interface TargetingRule {
  attribute: string;
  operator: 'equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface FlagVariant {
  key: string;
  value: any;
  weight?: number;
}

export interface FeatureFlagContext {
  userId?: string;
  userAttributes?: Record<string, any>;
  environment?: string;
}