import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class FileUploadOptionsDto {
  @ApiPropertyOptional({ description: 'Upload folder', example: 'documents' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Generate thumbnail for images', example: true })
  @IsOptional()
  @IsBoolean()
  generateThumbnail?: boolean;

  @ApiPropertyOptional({ description: 'Process file asynchronously', example: false })
  @IsOptional()
  @IsBoolean()
  processAsync?: boolean;
}

export class FileResponseDto {
  @ApiProperty({ description: 'File ID', example: 'file_1234567890_abc123' })
  id: string;

  @ApiProperty({ description: 'Original filename', example: 'document.pdf' })
  filename: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  size: number;

  @ApiProperty({ description: 'MIME type', example: 'application/pdf' })
  mimetype: string;

  @ApiProperty({ description: 'File URL', example: 'https://storage.example.com/files/document.pdf' })
  url: string;

  @ApiProperty({ description: 'Upload timestamp', example: '2024-01-15T10:30:00.000Z' })
  uploadedAt: Date;

  @ApiPropertyOptional({ description: 'Async processing status', example: false })
  processAsync?: boolean;
}

export class FileInfoDto {
  @ApiProperty({ description: 'File ID', example: 'file_1234567890_abc123' })
  id: string;

  @ApiProperty({ description: 'Original filename', example: 'document.pdf' })
  originalName: string;

  @ApiProperty({ description: 'Stored filename', example: '1234567890_abc123.pdf' })
  filename: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  size: number;

  @ApiProperty({ description: 'MIME type', example: 'application/pdf' })
  mimetype: string;

  @ApiProperty({ description: 'File URL', example: 'https://storage.example.com/files/document.pdf' })
  url: string;

  @ApiProperty({ description: 'Uploaded by user ID', example: 'user-123' })
  uploadedBy: string;

  @ApiProperty({ description: 'Upload timestamp', example: '2024-01-15T10:30:00.000Z' })
  uploadedAt: Date;
}

export class FileListOptionsDto {
  @ApiPropertyOptional({ description: 'Filter by folder', example: 'documents' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class FileListResponseDto {
  @ApiProperty({ description: 'List of files', type: [FileInfoDto] })
  files: FileInfoDto[];

  @ApiProperty({ description: 'Total number of files', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total pages', example: 3 })
  totalPages: number;
}

export class MultipleFileUploadResponseDto {
  @ApiProperty({ description: 'Successfully uploaded files', type: [FileResponseDto] })
  uploaded: FileResponseDto[];

  @ApiProperty({ description: 'Upload errors' })
  errors: Array<{
    filename: string;
    error: string;
  }>;

  @ApiProperty({ description: 'Total files processed', example: 5 })
  totalFiles: number;

  @ApiProperty({ description: 'Successfully uploaded count', example: 4 })
  successCount: number;

  @ApiProperty({ description: 'Error count', example: 1 })
  errorCount: number;
}

export class FileStatsDto {
  @ApiProperty({ description: 'Total number of files', example: 42 })
  totalFiles: number;

  @ApiProperty({ description: 'Total storage used', example: '156.7 MB' })
  totalSize: string;

  @ApiProperty({ description: 'File types breakdown' })
  fileTypes: {
    images: number;
    documents: number;
    others: number;
  };

  @ApiProperty({ description: 'Uploads by month' })
  uploadsByMonth: {
    current: number;
    previous: number;
  };

  @ApiProperty({ description: 'Storage used', example: '156.7 MB' })
  storageUsed: string;

  @ApiProperty({ description: 'Storage limit', example: '1 GB' })
  storageLimit: string;

  @ApiProperty({ description: 'Recent uploads count', example: 5 })
  recentUploads: number;
}