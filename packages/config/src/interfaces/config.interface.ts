export interface ConfigSchema {
  [key: string]: ConfigProperty;
}

export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  default?: any;
  validation?: ValidationRule[];
  description?: string;
  env?: string;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message?: string;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigError[];
}

export interface ConfigError {
  path: string;
  message: string;
  value?: any;
}