export class ApiSuccessResponse {
  success = true;
  message = '';
  data: any = null;
  timestamp = new Date().toISOString();
  requestId = '';
}

export class ApiErrorResponse {
  success = false;
  error = '';
  message = '';
  statusCode = 500;
  timestamp = new Date().toISOString();
  path = '';
  requestId = '';
}

export class PaginationMeta {
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 1;
  hasNext = false;
  hasPrev = false;
}

export class PaginatedResponse {
  data: any[] = [];
  pagination = new PaginationMeta();
  timestamp = new Date().toISOString();
  requestId = '';
}

export class HealthCheckResponse {
  status = 'ok';
  timestamp = new Date().toISOString();
  uptime = 0;
  version = '1.0.0';
  environment = 'development';
  services: any[] = [];
}

export class BulkOperationResponse {
  success = true;
  affected = 0;
  successful: any[] = [];
}

export class FileUploadResponse {
  filename = '';
  url = '';
  size = 0;
  mimeType = '';
  uploadedAt = new Date().toISOString();
}