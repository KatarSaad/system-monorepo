import { Injectable, BadRequestException } from '@nestjs/common';
import { UploadOptions } from '../interfaces/file-storage.interface';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class FileValidationService {
  constructor(private metrics: MetricsService) {}

  validateFile(file: Buffer, filename: string, options?: UploadOptions): void {
    this.validateSize(file, options?.maxSize);
    this.validateMimeType(filename, options?.allowedMimeTypes);
    this.validateFilename(filename);
    
    this.metrics.incrementCounter('file_validation_success', 1);
  }

  private validateSize(file: Buffer, maxSize = 10 * 1024 * 1024): void {
    if (file.length > maxSize) {
      this.metrics.incrementCounter('file_validation_size_failed', 1);
      throw new BadRequestException(`File size exceeds limit of ${maxSize} bytes`);
    }
  }

  private validateMimeType(filename: string, allowedTypes?: string[]): void {
    if (!allowedTypes) return;

    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'pdf': 'application/pdf',
      'txt': 'text/plain'
    };

    const mimeType = extension ? mimeTypeMap[extension] : undefined;
    
    if (!mimeType || !allowedTypes.includes(mimeType)) {
      this.metrics.incrementCounter('file_validation_type_failed', 1);
      throw new BadRequestException(`File type not allowed: ${extension}`);
    }
  }

  private validateFilename(filename: string): void {
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      this.metrics.incrementCounter('file_validation_name_failed', 1);
      throw new BadRequestException('Filename contains invalid characters');
    }

    if (filename.length > 255) {
      this.metrics.incrementCounter('file_validation_name_failed', 1);
      throw new BadRequestException('Filename too long');
    }
  }

  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }
}