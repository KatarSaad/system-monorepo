# @system/validation Package Architecture

## Overview
Comprehensive validation services with rule-based validation, schema validation, and custom validators.

## Current Structure
```
src/
├── services/
│   ├── validation.service.ts
│   └── advanced-validation.service.ts
├── decorators/          # Custom validation decorators
├── schemas/            # Validation schemas
├── validators/         # Custom validators
├── validation.module.ts
└── index.ts
```

## Architecture Principles

### 1. **Composable Validation**
- Small, focused validators that can be combined
- Rule-based system for complex validations
- Extensible through custom validators

### 2. **Type Safety**
- Generic validation methods
- Strong typing for validation results
- Schema-based validation with TypeScript support

## Best Practices

### ✅ **Module Structure**
```typescript
@Global()
@Module({
  providers: [
    ValidationService,
    AdvancedValidationService,
    {
      provide: 'VALIDATION_RULES',
      useFactory: () => new Map(),
    },
  ],
  exports: [
    ValidationService,
    AdvancedValidationService,
  ],
})
export class ValidationModule {}
```

### ✅ **Interface Design**
```typescript
export interface IValidationService {
  validate<T>(data: T, rules: ValidationRules): Promise<ValidationResult>;
  validateObject<T>(obj: T, schema: ValidationSchema): Promise<ValidationResult>;
  addCustomValidator(name: string, validator: ValidatorFunction): void;
}

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
```

### ✅ **Rule-Based Validation**
```typescript
export type ValidationRules = {
  [field: string]: ValidationRule[];
};

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
```

## Transformation Guidelines

### 1. **Configuration Support**
```typescript
export interface ValidationModuleOptions {
  defaultLocale?: string;
  customValidators?: Map<string, ValidatorFunction>;
  schemas?: Map<string, ValidationSchema>;
  errorMessages?: Map<string, string>;
}

@Module({})
export class ValidationModule {
  static forRoot(options?: ValidationModuleOptions): DynamicModule {
    return {
      module: ValidationModule,
      providers: [
        {
          provide: 'VALIDATION_OPTIONS',
          useValue: options || {},
        },
        ValidationService,
        AdvancedValidationService,
      ],
      exports: [ValidationService, AdvancedValidationService],
    };
  }
}
```

### 2. **Custom Validator Pattern**
```typescript
export type ValidatorFunction = (
  value: any,
  params?: any,
  context?: ValidationContext
) => Promise<boolean> | boolean;

@Injectable()
export class ValidationService {
  private validators = new Map<string, ValidatorFunction>();

  constructor(@Inject('VALIDATION_OPTIONS') private options: ValidationModuleOptions) {
    this.initializeBuiltInValidators();
    this.registerCustomValidators(options.customValidators);
  }

  addValidator(name: string, validator: ValidatorFunction): void {
    this.validators.set(name, validator);
  }

  async validateField(value: any, rules: ValidationRule[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      const validator = this.getValidator(rule);
      const isValid = await validator(value);
      
      if (!isValid) {
        errors.push({
          field: 'field',
          message: this.getErrorMessage(rule),
          code: this.getErrorCode(rule),
          value,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

### 3. **Schema Validation**
```typescript
export interface ValidationSchema {
  [field: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    rules?: ValidationRule[];
    nested?: ValidationSchema;
  };
}

@Injectable()
export class AdvancedValidationService {
  async validateSchema<T>(
    data: T,
    schema: ValidationSchema
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const [field, fieldSchema] of Object.entries(schema)) {
      const value = (data as any)[field];

      // Check required
      if (fieldSchema.required && (value === undefined || value === null)) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED',
        });
        continue;
      }

      // Type validation
      if (value !== undefined && !this.validateType(value, fieldSchema.type)) {
        errors.push({
          field,
          message: `${field} must be of type ${fieldSchema.type}`,
          code: 'INVALID_TYPE',
          value,
        });
      }

      // Rule validation
      if (fieldSchema.rules) {
        const fieldResult = await this.validateField(value, fieldSchema.rules);
        errors.push(...fieldResult.errors.map(e => ({ ...e, field })));
      }

      // Nested validation
      if (fieldSchema.nested && typeof value === 'object') {
        const nestedResult = await this.validateSchema(value, fieldSchema.nested);
        errors.push(...nestedResult.errors.map(e => ({ 
          ...e, 
          field: `${field}.${e.field}` 
        })));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

### 4. **Decorator Pattern**
```typescript
export function ValidateWith(rules: ValidationRule[]) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('validation:rules', rules, target, propertyKey);
  };
}

export function ValidateSchema(schema: ValidationSchema) {
  return function (target: any) {
    Reflect.defineMetadata('validation:schema', schema, target);
  };
}

// Usage
@ValidateSchema({
  email: { type: 'string', required: true, rules: ['email'] },
  age: { type: 'number', rules: ['min'] },
})
export class UserDto {
  @ValidateWith(['required', 'email'])
  email: string;

  @ValidateWith(['required', 'minLength'])
  name: string;
}
```

## Built-in Validators

```typescript
const builtInValidators: Map<string, ValidatorFunction> = new Map([
  ['required', (value) => value !== undefined && value !== null && value !== ''],
  ['email', (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)],
  ['minLength', (value, params) => value.length >= params.min],
  ['maxLength', (value, params) => value.length <= params.max],
  ['min', (value, params) => Number(value) >= params.min],
  ['max', (value, params) => Number(value) <= params.max],
  ['pattern', (value, params) => new RegExp(params.pattern).test(value)],
  ['url', (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }],
]);
```

## Usage Examples

### ✅ **Correct Usage**
```typescript
@Module({
  imports: [
    ValidationModule.forRoot({
      defaultLocale: 'en',
      customValidators: new Map([
        ['strongPassword', (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)]
      ])
    })
  ],
})
export class AuthModule {}

// In service
constructor(private validationService: ValidationService) {}

async validateUser(userData: any) {
  const result = await this.validationService.validateObject(userData, {
    email: ['required', 'email'],
    password: ['required', 'strongPassword'],
    name: ['required', 'string', 'minLength'],
  });

  if (!result.isValid) {
    throw new BadRequestException(result.errors);
  }
}
```

## Testing Strategy

```typescript
describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ValidationModule.forRoot()],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  it('should validate email format', async () => {
    const result = await service.validateObject(
      { email: 'invalid-email' },
      { email: ['required', 'email'] }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('INVALID_EMAIL');
  });
});
```

## Performance Considerations

1. **Async Validation** - Support for async validators
2. **Caching** - Cache compiled validation schemas
3. **Early Exit** - Stop validation on first error when appropriate
4. **Batch Validation** - Validate multiple objects efficiently