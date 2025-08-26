import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          const isLongEnough = value.length >= 8;
          
          return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
        }
      }
    });
  };
}

export function IsValidSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
      }
    });
  };
}