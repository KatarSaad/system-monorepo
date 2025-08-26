import { Module, Global } from '@nestjs/common';
import { RateLimiterService } from './services/rate-limiter.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { MonitoringModule } from '@katarsaad/monitoring';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), CoreModule],
  providers: [
    RateLimiterService,
    RateLimitGuard,
    RateLimitMiddleware,
  ],
  exports: [
    RateLimiterService,
    RateLimitGuard,
    RateLimitMiddleware,
  ],
})
export class RateLimitingModule {}