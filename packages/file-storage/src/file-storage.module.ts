import { Module, Global } from '@nestjs/common';
import { FileStorageService } from './services/file-storage.service';
import { FileValidationService } from './services/file-validation.service';
import { LocalFileAdapter } from './adapters/local.adapter';
import { S3Adapter } from './adapters/s3.adapter';
import { MonitoringModule } from '@katarsaad/monitoring';
// import { SecurityModule } from '@katarsaad/security';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), CoreModule],
  providers: [FileStorageService, FileValidationService, LocalFileAdapter, S3Adapter],
  exports: [FileStorageService, FileValidationService, LocalFileAdapter, S3Adapter],
})
export class FileStorageModule {}