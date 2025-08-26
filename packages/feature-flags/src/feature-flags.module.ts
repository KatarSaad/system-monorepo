import { Module, Global } from '@nestjs/common';
import { FeatureFlagsService } from './services/feature-flags.service';
import { FeatureFlagGuard } from './guards/feature-flag.guard';
import { MonitoringModule } from '@katarsaad/monitoring';
import { CoreModule } from '@katarsaad/core';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), CoreModule],
  providers: [FeatureFlagsService, FeatureFlagGuard],
  exports: [FeatureFlagsService, FeatureFlagGuard],
})
export class FeatureFlagsModule {}