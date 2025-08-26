# API Documentation

## 🚀 API Overview

The system provides RESTful APIs following OpenAPI 3.0 specification with comprehensive Swagger documentation.

### Base URL
```
Development: http://localhost:3000/api
Production: https://api.yourdomain.com/api
```

### Authentication
```http
Authorization: Bearer <jwt_token>
```

## 📋 API Standards

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": []
  }
}
```

### HTTP Status Codes

- `200` - OK (Success)
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## 🔧 Swagger Configuration

```typescript
// swagger.config.ts
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Enterprise System API')
  .setDescription('Comprehensive API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('Users', 'User management operations')
  .addTag('Orders', 'Order management operations')
  .build();
```

### API Documentation Decorators

```typescript
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createUser(@Body() dto: CreateUserDto): Promise<UserDto> {
    // Implementation
  }
}
```

## 📊 API Modules

### User Management API

**Endpoints:**
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users` - List users with pagination

**Example Request:**
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

### Order Management API

**Endpoints:**
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders` - List orders

### Authentication API

**Endpoints:**
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

## 🔒 Security

### Rate Limiting
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
export class UserController {
  // Controller methods
}
```

### Input Validation
```typescript
export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @Length(2, 50)
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
  @Length(2, 50)
  @ApiProperty({ example: 'Doe' })
  lastName: string;
}
```

## 📈 API Monitoring

### Health Check Endpoint
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "memory": "healthy"
  }
}
```

### Metrics Endpoint
```http
GET /api/metrics
```

## 🧪 Testing APIs

### Using Swagger UI
Access interactive API documentation at:
```
http://localhost:3000/api/docs
```

### Using Postman
Import the OpenAPI specification:
```
http://localhost:3000/api/docs-json
```

### cURL Examples
```bash
# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"email":"test@example.com","firstName":"John","lastName":"Doe"}'

# Get user
curl -X GET http://localhost:3000/api/users/123 \
  -H "Authorization: Bearer <token>"
```