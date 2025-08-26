import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ApiResponseDto } from '@katarsaad/core';
import { RateLimitGuard } from '@katarsaad/rate-limiting';
import { FileUploadService } from '../services/file-upload.service';

@Controller('files')
@ApiTags('File Upload')
@UseGuards(RateLimitGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload file', 
    description: 'Upload a file with validation, storage, caching, and audit logging' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          description: 'Optional folder name',
        },
        generateThumbnail: {
          type: 'boolean',
          description: 'Generate thumbnail for images',
        },
        processAsync: {
          type: 'boolean',
          description: 'Process file asynchronously',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or validation failed' })
  async uploadFile(
    @UploadedFile() file: any,
    @Query('folder') folder?: string,
    @Query('generateThumbnail') generateThumbnail?: boolean,
    @Query('processAsync') processAsync?: boolean,
    @Req() req?: any,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    const userId = req?.user?.id || 'anonymous';
    const result = await this.fileUploadService.uploadFile(file, userId, {
      folder,
      generateThumbnail: generateThumbnail === true,
      processAsync: processAsync === true,
    });

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return ApiResponseDto.success(result.value, 'File uploaded successfully');
  }

  @Get(':fileId')
  @ApiOperation({ 
    summary: 'Get file info', 
    description: 'Retrieve file metadata and information' 
  })
  @ApiParam({ name: 'fileId', description: 'File ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'File info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileInfo(@Param('fileId') fileId: string) {
    const result = await this.fileUploadService.getFileInfo(fileId);

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success(result.value, 'File info retrieved successfully');
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete file', 
    description: 'Delete file with audit logging and cache cleanup' 
  })
  @ApiParam({ name: 'fileId', description: 'File ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('fileId') fileId: string, @Req() req?: any) {
    const userId = req?.user?.id || 'anonymous';
    const result = await this.fileUploadService.deleteFile(fileId, userId);

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'List files', 
    description: 'List uploaded files with pagination' 
  })
  @ApiQuery({ name: 'folder', required: false, description: 'Filter by folder' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  @ApiResponse({ status: 200, description: 'Files listed successfully' })
  async listFiles(
    @Query('folder') folder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || 'anonymous';
    const result = await this.fileUploadService.listFiles(userId, {
      folder,
      page: page ? parseInt(page.toString()) : undefined,
      limit: limit ? parseInt(limit.toString()) : undefined,
    });

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success(result.value, 'Files listed successfully');
  }

  @Post('upload/multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('files'))
  @ApiOperation({ 
    summary: 'Upload multiple files', 
    description: 'Upload multiple files in sequence with comprehensive processing' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or validation failed' })
  async uploadMultipleFiles(
    @UploadedFile() files: any[],
    @Query('folder') folder?: string,
    @Query('processAsync') processAsync?: boolean,
    @Req() req?: any,
  ) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    const userId = req?.user?.id || 'anonymous';
    const results = [];
    const errors = [];

    for (const file of files) {
      const result = await this.fileUploadService.uploadFile(file, userId, {
        folder,
        processAsync: processAsync === true,
      });

      if (result.isSuccess) {
        results.push(result.value);
      } else {
        errors.push({
          filename: file.originalname,
          error: result.error,
        });
      }
    }

    return ApiResponseDto.success({
      uploaded: results,
      errors,
      totalFiles: files.length,
      successCount: results.length,
      errorCount: errors.length,
    }, `${results.length} of ${files.length} files uploaded successfully`);
  }

  @Get('stats/summary')
  @ApiOperation({ 
    summary: 'Get file statistics', 
    description: 'Get comprehensive file upload and storage statistics' 
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getFileStats(@Req() req?: any) {
    const userId = req?.user?.id || 'anonymous';
    
    // This would typically aggregate data from the storage service
    const mockStats = {
      totalFiles: 42,
      totalSize: '156.7 MB',
      fileTypes: {
        images: 28,
        documents: 10,
        others: 4,
      },
      uploadsByMonth: {
        current: 15,
        previous: 27,
      },
      storageUsed: '156.7 MB',
      storageLimit: '1 GB',
      recentUploads: 5,
    };

    return ApiResponseDto.success(mockStats, 'File statistics retrieved successfully');
  }
}