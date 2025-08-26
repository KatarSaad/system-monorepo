import { Module, Global, DynamicModule } from '@nestjs/common';
import { ValidationService } from './services/validation.service';
import { AdvancedValidationService } from './services/advanced-validation.service';
import { TransformPipe } from './pipes/transform.pipe';
import { BusinessSchemas } from './schemas/business.schemas';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { IValidationService, ValidatorFunction } from './interfaces/validation.interface';
import { CoreModule } from '@katarsaad/core';
import { MonitoringModule } from '@katarsaad/monitoring';

export interface ValidationModuleOptions {
  defaultLocale?: string;
  customValidators?: Map<string, ValidatorFunction>;
  errorMessages?: Map<string, string>;
}

@Global()
@Module({})
export class ValidationModule {
  static forRoot(options?: ValidationModuleOptions): DynamicModule {
    return {
      module: ValidationModule,
      imports: [CoreModule, MonitoringModule],
      providers: [
        {
          provide: 'VALIDATION_OPTIONS',
          useValue: options || {},
        },
        {
          provide: 'IValidationService',
          useClass: ValidationService,
        },
        ValidationService,
        AdvancedValidationService,
        TransformPipe,
        BusinessSchemas,
        ValidationMiddleware,
      ],
      exports: [
        'IValidationService',
        ValidationService,
        AdvancedValidationService,
        TransformPipe,
        BusinessSchemas,
        ValidationMiddleware,
      ],
    };
  }
}