import { Module } from '@nestjs/common';
import { SystemIntegrationService } from './system.service';

@Module({
  providers: [SystemIntegrationService],
  exports: [SystemIntegrationService],
})
export class SystemIntegrationModule {}