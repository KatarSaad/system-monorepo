import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class TransformPipe implements PipeTransform {
  constructor(private metrics: MetricsService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (!value) return value;

      // Type conversion
      if (metadata.type === 'param' || metadata.type === 'query') {
        value = this.convertTypes(value);
      }

      // Sanitization
      if (typeof value === 'string') {
        value = this.sanitizeString(value);
      }

      this.metrics.incrementCounter('validation_transforms', 1, { type: metadata.type });
      return value;
    } catch (error) {
      this.metrics.incrementCounter('validation_transform_failed', 1);
      throw new BadRequestException(`Transformation failed: ${error}`);
    }
  }

  private convertTypes(value: any): any {
    if (typeof value !== 'string') return value;

    // Boolean conversion
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Number conversion
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d*\.\d+$/.test(value)) return parseFloat(value);

    return value;
  }

  private sanitizeString(value: string): string {
    return value
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '');
  }
}