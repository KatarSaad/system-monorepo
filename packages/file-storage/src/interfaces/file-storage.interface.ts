export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

export interface UploadOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
  generateThumbnail?: boolean;
  encrypt?: boolean;
}

export interface StorageAdapter {
  upload(file: Buffer, filename: string, options?: UploadOptions): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getUrl(path: string): Promise<string>;
}