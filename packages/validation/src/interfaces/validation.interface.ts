export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export type ValidationRule = 
  | 'required'
  | 'email'
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | CustomValidationRule;

export interface CustomValidationRule {
  name: string;
  params?: any;
  message?: string;
}

export type ValidationRules = {
  [field: string]: ValidationRule[];
};

export interface IValidationService {
  validate<T>(data: T, rules: ValidationRules): Promise<ValidationResult>;
  validateObject<T>(obj: T, schema: ValidationRules): Promise<ValidationResult>;
  addCustomValidator(name: string, validator: ValidatorFunction): void;
}

export type ValidatorFunction = (
  value: any,
  params?: any,
  context?: ValidationContext
) => Promise<boolean> | boolean;

export interface ValidationContext {
  field: string;
  object: any;
  root: any;
}