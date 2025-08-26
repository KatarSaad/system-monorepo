import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ApiResponseDto } from '@katarsaad/core';
import { RateLimitGuard } from '@katarsaad/rate-limiting';
import { ExampleService } from '../services/example.service';
import { CreateExampleDto, UpdateExampleDto, SearchExampleDto, ExampleResponseDto } from '../dto/example.dto';

@Controller('examples')
@ApiTags('Examples')
@UseGuards(RateLimitGuard)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new example', description: 'Create a new example with validation, caching, and audit logging' })
  @ApiBody({ type: CreateExampleDto })
  @ApiResponse({ status: 201, description: 'Example created successfully', type: ExampleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createDto: CreateExampleDto, @Req() req: any) {
    const userId = req.user?.id || 'anonymous';
    const result = await this.exampleService.create(createDto, userId);

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return ApiResponseDto.success(result.value, 'Example created successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by ID', description: 'Retrieve example from cache or storage' })
  @ApiParam({ name: 'id', description: 'Example ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Example found', type: ExampleResponseDto })
  @ApiResponse({ status: 404, description: 'Example not found' })
  async findById(@Param('id') id: string) {
    const result = await this.exampleService.findById(id);

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!result.value) {
      throw new HttpException('Example not found', HttpStatus.NOT_FOUND);
    }

    return ApiResponseDto.success(result.value, 'Example retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update example', description: 'Update example with validation and audit logging' })
  @ApiParam({ name: 'id', description: 'Example ID', type: 'string' })
  @ApiBody({ type: UpdateExampleDto })
  @ApiResponse({ status: 200, description: 'Example updated successfully', type: ExampleResponseDto })
  @ApiResponse({ status: 404, description: 'Example not found' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExampleDto,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'anonymous';
    const result = await this.exampleService.update(id, updateDto, userId);

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new HttpException(result.error, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return ApiResponseDto.success(result.value, 'Example updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete example', description: 'Delete example with audit logging' })
  @ApiParam({ name: 'id', description: 'Example ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Example deleted successfully' })
  @ApiResponse({ status: 404, description: 'Example not found' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'anonymous';
    const result = await this.exampleService.delete(id, userId);

    if (result.isFailure) {
      if (result.error.includes('not found')) {
        throw new HttpException(result.error, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('search')
  @ApiOperation({ summary: 'Search examples', description: 'Search examples with pagination' })
  @ApiBody({ type: SearchExampleDto })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  async search(@Body() searchDto: SearchExampleDto) {
    const result = await this.exampleService.search(searchDto);

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }

    return ApiResponseDto.success(result.value, 'Search completed successfully');
  }

  @Post('cache/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cache', description: 'Clear all cached examples' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    const result = await this.exampleService.clearCache();

    if (result.isFailure) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success(null, 'Cache cleared successfully');
  }

  @Get('health/metrics')
  @ApiOperation({ summary: 'Get metrics info', description: 'Get information about collected metrics' })
  @ApiResponse({ status: 200, description: 'Metrics info retrieved' })
  async getMetrics() {
    // This would typically be handled by a dedicated metrics endpoint
    return ApiResponseDto.success(
      { message: 'Metrics are being collected' },
      'Metrics endpoint accessed'
    );
  }
}