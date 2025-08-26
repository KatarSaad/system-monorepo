import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { FEATURE_FLAG_KEY, FeatureFlagOptions } from '../decorators/feature-flag.decorator';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagsService: FeatureFlagsService,
    private metrics: MetricsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<FeatureFlagOptions>(
      FEATURE_FLAG_KEY,
      context.getHandler()
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    try {
      const isEnabled = await this.featureFlagsService.isEnabled(
        options.flag,
        userId
      );

      this.metrics.incrementCounter('feature_flag_check', 1, {
        flag: options.flag,
        enabled: isEnabled.toString(),
        userId: userId || 'anonymous'
      });

      return isEnabled;
    } catch (error) {
      this.metrics.incrementCounter('feature_flag_error', 1, {
        flag: options.flag
      });

      // Return fallback value on error
      return options.fallback ?? false;
    }
  }
}