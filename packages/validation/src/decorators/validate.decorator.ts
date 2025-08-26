import { applyDecorators, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function ValidateAndTransform(options?: any): MethodDecorator {
  return applyDecorators(
    UsePipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      ...options
    }))
  );
}

export function Sanitize(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim().replace(/[<>]/g, '');
    }
    return value;
  });
}