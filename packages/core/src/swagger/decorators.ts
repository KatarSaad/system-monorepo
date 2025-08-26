import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiProduces,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiStandardOperation = (summary: string, description?: string) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 403, description: 'Forbidden', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiPaginatedOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
  description?: string
) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({
      status: 200,
      description: 'Paginated results',
      schema: {
        allOf: [
          { $ref: '#/components/schemas/PaginatedResponse' },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiSecuredOperation = (summary: string, description?: string) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({ status: 200, description: 'Success' }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 403, description: 'Forbidden', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiCreateOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
  description?: string
) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiResponse({
      status: 201,
      description: 'Created successfully',
      schema: { $ref: getSchemaPath(model) },
    }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 409, description: 'Conflict', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiUpdateOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
  description?: string
) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiParam({ name: 'id', description: 'Resource ID', type: 'string' }),
    ApiResponse({
      status: 200,
      description: 'Updated successfully',
      schema: { $ref: getSchemaPath(model) },
    }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 404, description: 'Not Found', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiDeleteOperation = (summary: string, description?: string) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiParam({ name: 'id', description: 'Resource ID', type: 'string' }),
    ApiResponse({ status: 204, description: 'Deleted successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 404, description: 'Not Found', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiFileUpload = (summary: string, description?: string) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({ status: 201, description: 'File uploaded successfully' }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 413, description: 'File too large', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiHealthCheck = () =>
  applyDecorators(
    ApiTags('Health'),
    ApiOperation({ summary: 'Health check endpoint', description: 'Check the health status of the application and its dependencies' }),
    ApiResponse({
      status: 200,
      description: 'Health check successful',
      schema: { $ref: '#/components/schemas/HealthCheck' },
    }),
    ApiResponse({ status: 503, description: 'Service Unavailable', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );

export const ApiPaginationQuery = () =>
  applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field (default: createdAt)' }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' }),
  );

export const ApiSearchQuery = () =>
  applyDecorators(
    ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' }),
    ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter criteria' }),
  );

export const ApiBulkOperation = <TModel extends Type<any>>(
  model: TModel,
  operation: string,
  summary: string,
  description?: string
) =>
  applyDecorators(
    ApiOperation({ summary, description }),
    ApiBearerAuth('JWT-auth'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of resource IDs',
          },
          operation: {
            type: 'string',
            enum: ['activate', 'deactivate', 'delete', 'restore'],
            description: 'Bulk operation type',
          },
        },
        required: ['ids', 'operation'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Bulk operation completed',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          affected: { type: 'number' },
          results: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Bad Request', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 401, description: 'Unauthorized', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
    ApiResponse({ status: 500, description: 'Internal Server Error', schema: { $ref: '#/components/schemas/ErrorResponse' } }),
  );