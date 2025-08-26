import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@katarsaad/core';

export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T, context?: any) => boolean | Promise<boolean>;
  message: string | ((value: T, context?: any) => string);
}

export interface ValidationError {
  field: string;
  value: any;
  rule: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface SchemaValidationOptions {
  stopOnFirstError?: boolean;
  context?: any;
  customRules?: ValidationRule[];
}

@Injectable()
export class AdvancedValidationService {
  private readonly logger = new Logger(AdvancedValidationService.name);
  private readonly rules = new Map<string, ValidationRule>();

  constructor() {
    this.registerBuiltInRules();
  }

  registerRule<T>(rule: ValidationRule<T>): void {
    this.rules.set(rule.name, rule);
  }

  async validateField<T>(
    field: string,
    value: T,
    ruleName: string,
    context?: any
  ): Promise<Result<ValidationResult>> {
    try {
      const rule = this.rules.get(ruleName);
      if (!rule) {
        return Result.fail(`Validation rule '${ruleName}' not found`);
      }

      const isValid = await rule.validate(value, context);
      const errors: ValidationError[] = [];

      if (!isValid) {
        const message = typeof rule.message === 'function' 
          ? rule.message(value, context)
          : rule.message;

        errors.push({
          field,
          value,
          rule: ruleName,
          message,
        });
      }

      return Result.ok({ isValid, errors });
    } catch (error) {
      this.logger.error(`Validation error for field ${field}:`, error);
      return Result.fail(`Validation failed: ${error}`);
    }
  }

  async validateObject(
    obj: Record<string, any>,
    schema: Record<string, string[]>,
    options: SchemaValidationOptions = {}
  ): Promise<Result<ValidationResult>> {
    try {
      const { stopOnFirstError = false, context, customRules = [] } = options;
      const errors: ValidationError[] = [];

      // Register custom rules temporarily
      const tempRules = new Map<string, ValidationRule>();
      customRules.forEach(rule => {
        tempRules.set(rule.name, rule);
        this.rules.set(rule.name, rule);
      });

      for (const [field, ruleNames] of Object.entries(schema)) {
        const value = obj[field];

        for (const ruleName of ruleNames) {
          const result = await this.validateField(field, value, ruleName, context);
          
          if (result.isFailure) {
            return result;
          }

          if (!result.value.isValid) {
            errors.push(...result.value.errors);
            if (stopOnFirstError) {
              break;
            }
          }
        }

        if (stopOnFirstError && errors.length > 0) {
          break;
        }
      }

      // Clean up temporary rules
      tempRules.forEach((_, name) => {
        this.rules.delete(name);
      });

      return Result.ok({
        isValid: errors.length === 0,
        errors,
      });
    } catch (error) {
      this.logger.error('Object validation error:', error);
      return Result.fail(`Object validation failed: ${error}`);
    }
  }

  async validateArray<T>(
    items: T[],
    itemSchema: Record<string, string[]>,
    options: SchemaValidationOptions = {}
  ): Promise<Result<ValidationResult>> {
    try {
      const errors: ValidationError[] = [];
      const { stopOnFirstError = false } = options;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const result = await this.validateObject(
          item as Record<string, any>,
          itemSchema,
          { ...options, stopOnFirstError: false }
        );

        if (result.isFailure) {
          return result;
        }

        // Prefix field names with array index
        const itemErrors = result.value.errors.map(error => ({
          ...error,
          field: `[${i}].${error.field}`,
        }));

        errors.push(...itemErrors);

        if (stopOnFirstError && itemErrors.length > 0) {
          break;
        }
      }

      return Result.ok({
        isValid: errors.length === 0,
        errors,
      });
    } catch (error) {
      this.logger.error('Array validation error:', error);
      return Result.fail(`Array validation failed: ${error}`);
    }
  }

  private registerBuiltInRules(): void {
    // Required rule
    this.registerRule({
      name: 'required',
      validate: (value) => value !== null && value !== undefined && value !== '',
      message: 'Field is required',
    });

    // String rules
    this.registerRule({
      name: 'string',
      validate: (value) => typeof value === 'string',
      message: 'Field must be a string',
    });

    this.registerRule({
      name: 'minLength',
      validate: (value, context) => {
        if (typeof value !== 'string') return false;
        return value.length >= (context?.minLength || 0);
      },
      message: (value, context) => `Field must be at least ${context?.minLength || 0} characters long`,
    });

    this.registerRule({
      name: 'maxLength',
      validate: (value, context) => {
        if (typeof value !== 'string') return false;
        return value.length <= (context?.maxLength || Infinity);
      },
      message: (value, context) => `Field must be at most ${context?.maxLength || Infinity} characters long`,
    });

    // Number rules
    this.registerRule({
      name: 'number',
      validate: (value) => typeof value === 'number' && !isNaN(value),
      message: 'Field must be a valid number',
    });

    this.registerRule({
      name: 'integer',
      validate: (value) => Number.isInteger(value),
      message: 'Field must be an integer',
    });

    this.registerRule({
      name: 'min',
      validate: (value, context) => {
        if (typeof value !== 'number') return false;
        return value >= (context?.min || -Infinity);
      },
      message: (value, context) => `Field must be at least ${context?.min || -Infinity}`,
    });

    this.registerRule({
      name: 'max',
      validate: (value, context) => {
        if (typeof value !== 'number') return false;
        return value <= (context?.max || Infinity);
      },
      message: (value, context) => `Field must be at most ${context?.max || Infinity}`,
    });

    // Email rule
    this.registerRule({
      name: 'email',
      validate: (value) => {
        if (typeof value !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: 'Field must be a valid email address',
    });

    // URL rule
    this.registerRule({
      name: 'url',
      validate: (value) => {
        if (typeof value !== 'string') return false;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Field must be a valid URL',
    });

    // UUID rule
    this.registerRule({
      name: 'uuid',
      validate: (value) => {
        if (typeof value !== 'string') return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
      },
      message: 'Field must be a valid UUID',
    });

    // Date rule
    this.registerRule({
      name: 'date',
      validate: (value) => {
        if (value instanceof Date) return !isNaN(value.getTime());
        if (typeof value === 'string') return !isNaN(Date.parse(value));
        return false;
      },
      message: 'Field must be a valid date',
    });

    // Array rule
    this.registerRule({
      name: 'array',
      validate: (value) => Array.isArray(value),
      message: 'Field must be an array',
    });

    // Object rule
    this.registerRule({
      name: 'object',
      validate: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
      message: 'Field must be an object',
    });

    // Boolean rule
    this.registerRule({
      name: 'boolean',
      validate: (value) => typeof value === 'boolean',
      message: 'Field must be a boolean',
    });

    // Pattern rule
    this.registerRule({
      name: 'pattern',
      validate: (value, context) => {
        if (typeof value !== 'string') return false;
        const pattern = context?.pattern;
        if (!pattern) return false;
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        return regex.test(value);
      },
      message: (value, context) => `Field must match pattern: ${context?.pattern}`,
    });

    // In rule (enum-like)
    this.registerRule({
      name: 'in',
      validate: (value, context) => {
        const allowedValues = context?.values || [];
        return allowedValues.includes(value);
      },
      message: (value, context) => `Field must be one of: ${(context?.values || []).join(', ')}`,
    });

    // Custom async rule example
    this.registerRule({
      name: 'unique',
      validate: async (value, context) => {
        // This would typically check against a database
        const checkUnique = context?.checkUnique;
        if (typeof checkUnique === 'function') {
          return await checkUnique(value);
        }
        return true;
      },
      message: 'Field must be unique',
    });
  }

  getRules(): string[] {
    return Array.from(this.rules.keys());
  }

  hasRule(name: string): boolean {
    return this.rules.has(name);
  }

  removeRule(name: string): boolean {
    return this.rules.delete(name);
  }
}