import { Module, Global, MiddlewareConsumer } from '@nestjs/common';
import { LoggingService } from './services/logging.service';
import { WinstonAdapter } from './adapters/winston.adapter';
import { PinoAdapter } from './adapters/pino.adapter';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { MonitoringModule } from '@katarsaad/monitoring';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), CoreModule],
  providers: [
    LoggingService,
    WinstonAdapter,
    PinoAdapter,
    LoggingMiddleware,
  ],
  exports: [
    LoggingService,
    WinstonAdapter,
    PinoAdapter,
    LoggingMiddleware,
  ],
})
export class LoggingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}