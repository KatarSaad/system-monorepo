import { SetMetadata, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadOptions } from '../interfaces/file-storage.interface';

export const FILE_UPLOAD_KEY = 'file_upload';

export const FileUpload = (fieldName = 'file', options?: UploadOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(FILE_UPLOAD_KEY, { fieldName, options })(target, propertyKey, descriptor);
    UseInterceptors(FileInterceptor(fieldName))(target, propertyKey, descriptor);
  };
};