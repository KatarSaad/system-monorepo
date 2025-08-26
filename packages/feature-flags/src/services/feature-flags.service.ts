import { Injectable, Optional } from '@nestjs/common';
import { CacheService } from '@katarsaad/core';
import { MetricsService } from '@katarsaad/monitoring';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  userTargeting?: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class FeatureFlagsService {
  private flags = new Map<string, FeatureFlag>();

  constructor(
    @Optional() private cacheService: CacheService,
    @Optional() private metricsService: MetricsService
  ) {
    this.initializeMetrics();
    this.loadDefaultFlags();
  }

  async isEnabled(key: string, userId?: string): Promise<boolean> {
    const cacheKey = `feature:${key}:${userId || 'anonymous'}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached.isSuccess && cached.value !== null) {
      this.metricsService?.incrementCounter('feature_flag_cache_hit', 1, { flag: key });
      return cached.value as boolean;
    }

    const flag = this.flags.get(key);
    if (!flag) {
      this.metricsService?.incrementCounter('feature_flag_not_found', 1, { flag: key });
      return false;
    }

    let enabled = flag.enabled;

    // User targeting
    if (flag.userTargeting && userId) {
      enabled = flag.userTargeting.includes(userId);
    }
    // Rollout percentage
    else if (flag.rolloutPercentage && userId) {
      const hash = this.hashUserId(userId);
      enabled = hash < flag.rolloutPercentage;
    }

    await this.cacheService.set(cacheKey, enabled, { ttl: 300 });
    
    this.metricsService?.incrementCounter('feature_flag_evaluated', 1, { 
      flag: key, 
      enabled: enabled.toString() 
    });

    return enabled;
  }

  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag);
    this.cacheService?.invalidateByPattern(new RegExp(`feature:${flag.key}:.*`));
    this.metricsService?.incrementCounter('feature_flag_updated', 1, { flag: flag.key });
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.flags.get(key);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }

  private loadDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      { key: 'new_ui', enabled: false, rolloutPercentage: 10 },
      { key: 'advanced_search', enabled: true },
      { key: 'beta_features', enabled: false }
    ];

    defaultFlags.forEach(flag => this.setFlag(flag));
  }

  private initializeMetrics() {
    if (this.metricsService) {
      this.metricsService.createCounter('feature_flag_evaluated', 'Feature flag evaluations');
      this.metricsService.createCounter('feature_flag_cache_hit', 'Feature flag cache hits');
      this.metricsService.createCounter('feature_flag_not_found', 'Feature flag not found');
      this.metricsService.createCounter('feature_flag_updated', 'Feature flag updates');
    }
  }
}