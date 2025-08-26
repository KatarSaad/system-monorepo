import { Injectable, Optional } from '@nestjs/common';
import { Result } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';
// import { EncryptionService } from '@katarsaad/security';

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  encrypt?: boolean;
}

export interface StoredFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

export interface FileAdapter {
  upload(file: Buffer, filename: string, options?: any): Promise<Result<string>>;
  download(path: string): Promise<Result<Buffer>>;
  delete(path: string): Promise<Result<void>>;
  exists(path: string): Promise<Result<boolean>>;
}

@Injectable()
export class FileStorageService {
  private adapters = new Map<string, FileAdapter>();
  private defaultAdapter = 'local';

  constructor(
    @Optional() private metricsService: MetricsService
  ) {
    this.initializeMetrics();
  }

  registerAdapter(name: string, adapter: FileAdapter): void {
    this.adapters.set(name, adapter);
  }

  setDefaultAdapter(name: string): void {
    this.defaultAdapter = name;
  }

  async upload(
    file: Buffer, 
    originalName: string, 
    options: FileUploadOptions = {},
    adapterName?: string
  ): Promise<Result<StoredFile>> {
    const adapter = this.adapters.get(adapterName || this.defaultAdapter);
    if (!adapter) {
      return Result.fail('Storage adapter not found');
    }

    // Validate file
    const validation = this.validateFile(file, originalName, options);
    if (validation.isFailure) {
      this.metricsService?.incrementCounter('file_upload_failed', 1, { reason: 'validation' });
      return Result.fail(validation.error);
    }

    try {
      const fileId = this.generateFileId();
      const extension = originalName.split('.').pop() || '';
      const filename = `${fileId}.${extension}`;

      let processedFile = file;
      // Encryption disabled for now
      // if (options.encrypt && this.encryptionService) {
      //   const encrypted = await this.encryptionService.encrypt(
      //     file.toString('base64'), 
      //     process.env.FILE_ENCRYPTION_KEY || 'default-key'
      //   );
      //   if (encrypted.isFailure) {
      //     return Result.fail('File encryption failed');
      //   }
      //   processedFile = Buffer.from(encrypted.value.data, 'hex');
      // }

      const uploadResult = await adapter.upload(processedFile, filename);
      if (uploadResult.isFailure) {
        this.metricsService?.incrementCounter('file_upload_failed', 1, { reason: 'storage' });
        return Result.fail(uploadResult.error);
      }

      const storedFile: StoredFile = {
        id: fileId,
        originalName,
        filename,
        path: uploadResult.value,
        size: file.length,
        mimeType: this.getMimeType(originalName),
        uploadedAt: new Date(),
        metadata: { encrypted: options.encrypt }
      };

      this.metricsService?.incrementCounter('file_upload_success', 1);
      this.metricsService?.observeHistogram('file_size_bytes', file.length, 
        [1024, 10240, 102400, 1048576, 10485760]);

      return Result.ok(storedFile);
    } catch (error) {
      this.metricsService?.incrementCounter('file_upload_failed', 1, { reason: 'error' });
      return Result.fail(`Upload failed: ${error}`);
    }
  }

  async download(path: string, adapterName?: string): Promise<Result<Buffer>> {
    const adapter = this.adapters.get(adapterName || this.defaultAdapter);
    if (!adapter) {
      return Result.fail('Storage adapter not found');
    }

    try {
      const result = await adapter.download(path);
      if (result.isSuccess) {
        this.metricsService?.incrementCounter('file_download_success', 1);
      } else {
        this.metricsService?.incrementCounter('file_download_failed', 1);
      }
      return result;
    } catch (error) {
      this.metricsService?.incrementCounter('file_download_failed', 1);
      return Result.fail(`Download failed: ${error}`);
    }
  }

  async delete(path: string, adapterName?: string): Promise<Result<void>> {
    const adapter = this.adapters.get(adapterName || this.defaultAdapter);
    if (!adapter) {
      return Result.fail('Storage adapter not found');
    }

    const result = await adapter.delete(path);
    if (result.isSuccess) {
      this.metricsService?.incrementCounter('file_delete_success', 1);
    } else {
      this.metricsService?.incrementCounter('file_delete_failed', 1);
    }
    return result;
  }

  private validateFile(file: Buffer, filename: string, options: FileUploadOptions): Result<void> {
    if (options.maxSize && file.length > options.maxSize) {
      return Result.fail(`File too large. Max size: ${options.maxSize} bytes`);
    }

    if (options.allowedTypes) {
      const mimeType = this.getMimeType(filename);
      if (!options.allowedTypes.includes(mimeType)) {
        return Result.fail(`File type not allowed: ${mimeType}`);
      }
    }

    return Result.ok();
  }

  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics() {
    if (this.metricsService) {
      this.metricsService.createCounter('file_upload_success', 'Successful file uploads');
      this.metricsService.createCounter('file_upload_failed', 'Failed file uploads');
      this.metricsService.createCounter('file_download_success', 'Successful file downloads');
      this.metricsService.createCounter('file_download_failed', 'Failed file downloads');
      this.metricsService.createCounter('file_delete_success', 'Successful file deletions');
      this.metricsService.createCounter('file_delete_failed', 'Failed file deletions');
    }
  }
}