export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  correlationId?: string;

  constructor(data?: T, message?: string, correlationId?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
  }

  static success<T>(
    data?: T,
    message?: string,
    correlationId?: string
  ): ApiResponseDto<T> {
    return new ApiResponseDto(data, message, correlationId);
  }

  static error<T>(
    message: string,
    statusCode?: number,
    correlationId?: string
  ): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = false;
    response.message = message;
    response.data = undefined;
    return response;
  }
}

export class ApiErrorDto {
  success: boolean = false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  correlationId?: string;

  constructor(
    code: string,
    message: string,
    details?: any,
    correlationId?: string
  ) {
    this.error = { code, message, details };
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
  }

  static create(
    code: string,
    message: string,
    details?: any,
    correlationId?: string
  ): ApiErrorDto {
    return new ApiErrorDto(code, message, details, correlationId);
  }
}
