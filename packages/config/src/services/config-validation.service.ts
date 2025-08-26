import { Injectable } from '@nestjs/common';
import { ConfigSchema, ConfigValidationResult, ConfigError, ValidationRule } from '../interfaces/config.interface';

@Injectable()
export class ConfigValidationService {
  validateConfig(config: any, schema: ConfigSchema): ConfigValidationResult {
    const errors: ConfigError[] = [];

    for (const [key, property] of Object.entries(schema)) {
      const value = config[key];
      const keyErrors = this.validateProperty(key, value, property);
      errors.push(...keyErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateProperty(path: string, value: any, property: any): ConfigError[] {
    const errors: ConfigError[] = [];

    // Required validation
    if (property.required && (value === undefined || value === null)) {
      errors.push({
        path,
        message: `${path} is required`,
        value
      });
      return errors;
    }

    // Skip further validation if value is undefined and not required
    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    if (!this.validateType(value, property.type)) {
      errors.push({
        path,
        message: `${path} must be of type ${property.type}`,
        value
      });
    }

    // Custom validations
    if (property.validation) {
      for (const rule of property.validation) {
        const ruleError = this.validateRule(path, value, rule);
        if (ruleError) {
          errors.push(ruleError);
        }
      }
    }

    return errors;
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private validateRule(path: string, value: any, rule: ValidationRule): ConfigError | null {
    switch (rule.type) {
      case 'min':
        if (typeof value === 'number' && value < rule.value) {
          return { path, message: rule.message || `${path} must be at least ${rule.value}`, value };
        }
        break;
      case 'max':
        if (typeof value === 'number' && value > rule.value) {
          return { path, message: rule.message || `${path} must be at most ${rule.value}`, value };
        }
        break;
      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          return { path, message: rule.message || `${path} does not match required pattern`, value };
        }
        break;
      case 'enum':
        if (!rule.value.includes(value)) {
          return { path, message: rule.message || `${path} must be one of: ${rule.value.join(', ')}`, value };
        }
        break;
    }
    return null;
  }
}