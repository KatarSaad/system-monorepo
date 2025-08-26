import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MetricsService } from '@katarsaad/monitoring';
import { HealthService } from '@katarsaad/health';
// Swagger configuration
const swaggerConfig = {
  title: 'System API',
  description: 'Enterprise System API Documentation',
  version: '1.0.0',
  tag: 'api'
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Global validation pipe - disabled for testing
    // app.useGlobalPipes(new ValidationPipe({
    //   whitelist: true,
    //   forbidNonWhitelisted: true,
    //   transform: true,
    //   transformOptions: {
    //     enableImplicitConversion: true,
    //   },
    // }));

    // CORS configuration
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Swagger documentation
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle(swaggerConfig.title)
        .setDescription(swaggerConfig.description)
        .setVersion(swaggerConfig.version)
        .addBearerAuth()
        .addTag(swaggerConfig.tag)
        .build();
      
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      
      logger.log('Swagger documentation enabled at /api/docs');
    }

    // Initialize services
    const metricsService = app.get(MetricsService);
    const healthService = app.get(HealthService);

    // Initialize metrics
    metricsService.createCounter('app_starts', 'Application start count');
    metricsService.incrementCounter('app_starts', 1);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT received, shutting down gracefully');
      await app.close();
      process.exit(0);
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🏥 Health Check: http://localhost:${port}/api/v1/health`);
    logger.log(`📊 Metrics: http://localhost:${port}/api/v1/health/metrics`);

  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();