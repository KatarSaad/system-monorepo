# Validation Services Documentation

## AdvancedValidationService

Comprehensive validation service with custom rules, schema validation, and async validation support.

### Features
- **Custom Validation Rules** - Register and use custom validation rules
- **Schema Validation** - Validate objects against defined schemas
- **Array Validation** - Validate arrays of objects
- **Async Validation** - Support for asynchronous validation rules
- **Built-in Rules** - Comprehensive set of built-in validation rules
- **Context Support** - Pass context data to validation rules

### Built-in Rules

- `required` - Field must not be null, undefined, or empty
- `string` - Field must be a string
- `number` - Field must be a valid number
- `integer` - Field must be an integer
- `email` - Field must be a valid email address
- `url` - Field must be a valid URL
- `uuid` - Field must be a valid UUID
- `date` - Field must be a valid date
- `array` - Field must be an array
- `object` - Field must be an object
- `boolean` - Field must be a boolean
- `minLength` - String must have minimum length
- `maxLength` - String must have maximum length
- `min` - Number must be at least minimum value
- `max` - Number must be at most maximum value
- `pattern` - String must match regex pattern
- `in` - Value must be in allowed list
- `unique` - Value must be unique (async)

### Usage

#### Basic Field Validation

```typescript
import { AdvancedValidationService } from '@system/validation';

// Validate single field
const result = await validationService.validateField(
  'email',
  'user@example.com',
  'email'
);

if (!result.value.isValid) {
  console.log('Validation errors:', result.value.errors);
}
```

#### Object Schema Validation

```typescript
const userSchema = {
  name: ['required', 'string', 'minLength'],
  email: ['required', 'email'],
  age: ['required', 'number', 'min'],
  website: ['url']
};

const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  website: 'https://johndoe.com'
};

const result = await validationService.validateObject(
  userData,
  userSchema,
  {
    context: {
      minLength: 2,
      min: 18
    }
  }
);

if (!result.value.isValid) {
  result.value.errors.forEach(error => {
    console.log(`${error.field}: ${error.message}`);
  });
}
```

#### Array Validation

```typescript
const users = [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
];

const result = await validationService.validateArray(
  users,
  {
    name: ['required', 'string'],
    email: ['required', 'email']
  }
);
```

#### Custom Validation Rules

```typescript
// Register custom rule
validationService.registerRule({
  name: 'strongPassword',
  validate: (password: string) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough;
  },
  message: 'Password must contain uppercase, lowercase, number, special character and be at least 8 characters long'
});

// Use custom rule
const result = await validationService.validateField(
  'password',
  'MyP@ssw0rd',
  'strongPassword'
);
```

#### Async Validation

```typescript
// Register async rule
validationService.registerRule({
  name: 'uniqueEmail',
  validate: async (email: string, context) => {
    const userRepository = context.userRepository;
    const existingUser = await userRepository.findByEmail(email);
    return !existingUser;
  },
  message: 'Email address is already taken'
});

// Use with context
const result = await validationService.validateField(
  'email',
  'user@example.com',
  'uniqueEmail',
  { userRepository: this.userRepository }
);
```

### API Reference

#### Core Methods
- `validateField<T>(field: string, value: T, ruleName: string, context?: any): Promise<Result<ValidationResult>>`
- `validateObject(obj: Record<string, any>, schema: Record<string, string[]>, options?: SchemaValidationOptions): Promise<Result<ValidationResult>>`
- `validateArray<T>(items: T[], itemSchema: Record<string, string[]>, options?: SchemaValidationOptions): Promise<Result<ValidationResult>>`

#### Rule Management
- `registerRule<T>(rule: ValidationRule<T>): void`
- `getRules(): string[]`
- `hasRule(name: string): boolean`
- `removeRule(name: string): boolean`

### Validation Options

```typescript
interface SchemaValidationOptions {
  stopOnFirstError?: boolean;    // Stop validation on first error
  context?: any;                 // Context data for validation rules
  customRules?: ValidationRule[]; // Temporary custom rules
}
```

### Error Handling

```typescript
interface ValidationError {
  field: string;      // Field name that failed validation
  value: any;         // The value that failed
  rule: string;       // The validation rule that failed
  message: string;    // Human-readable error message
}

interface ValidationResult {
  isValid: boolean;           // Overall validation result
  errors: ValidationError[];  // Array of validation errors
}
```

### Example Service Integration

```typescript
@Injectable()
export class UserService {
  constructor(
    private validationService: AdvancedValidationService,
    private userRepository: UserRepository
  ) {}

  async createUser(userData: any) {
    // Define validation schema
    const schema = {
      name: ['required', 'string', 'minLength'],
      email: ['required', 'email', 'uniqueEmail'],
      age: ['required', 'number', 'min'],
      password: ['required', 'strongPassword']
    };

    // Validate user data
    const validation = await this.validationService.validateObject(
      userData,
      schema,
      {
        context: {
          minLength: 2,
          min: 18,
          userRepository: this.userRepository
        }
      }
    );

    if (!validation.value.isValid) {
      throw new ValidationException(validation.value.errors);
    }

    // Create user if validation passes
    return await this.userRepository.create(userData);
  }
}
```

### Best Practices

1. **Schema Definition** - Define validation schemas as constants for reusability
2. **Error Messages** - Provide clear, user-friendly error messages
3. **Context Usage** - Use context to pass dependencies for async validation
4. **Custom Rules** - Create domain-specific validation rules
5. **Performance** - Use `stopOnFirstError` for better performance when appropriate
6. **Testing** - Test validation rules thoroughly, especially custom ones