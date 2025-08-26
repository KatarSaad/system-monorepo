import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from '@katarsaad/health';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
