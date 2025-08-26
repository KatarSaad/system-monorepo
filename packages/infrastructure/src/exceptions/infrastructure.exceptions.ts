export class InfrastructureException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'InfrastructureException';
  }
}

export class DatabaseException extends InfrastructureException {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseException';
  }
}

export class ValidationException extends InfrastructureException {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationException';
  }
}

export class NotFoundExceptionInfra extends InfrastructureException {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundExceptionInfra';
  }
}

export class ConflictExceptionInfra extends InfrastructureException {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictExceptionInfra';
  }
}

export class CacheException extends InfrastructureException {
  constructor(message: string, details?: any) {
    super(message, 'CACHE_ERROR', 500, details);
    this.name = 'CacheException';
  }
}

export class SearchException extends InfrastructureException {
  constructor(message: string, details?: any) {
    super(message, 'SEARCH_ERROR', 500, details);
    this.name = 'SearchException';
  }
}