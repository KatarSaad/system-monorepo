import { Module, Global, DynamicModule } from '@nestjs/common';
import { Infrastructure, InfrastructureConfig, defaultConfig } from '../core/infrastructure';
import { CacheService } from '../core/cache.service';

@Global()
@Module({})
export class InfrastructureModule {
  static forRoot(config?: Partial<InfrastructureConfig>): DynamicModule {
    const infrastructureConfig: InfrastructureConfig = {
      database: {
        url: process.env.DATABASE_URL || 'mysql://localhost:3306/system_db',
        provider: 'mysql',
      },
      cache: {
        provider: 'memory',
        ttl: 3600,
      },
      analytics: {
        enabled: true,
        retention: 90,
      },
      audit: {
        enabled: true,
        exclude: ['password', 'token', 'secret'],
      },
      models: {},
      ...config,
    };

    return {
      module: InfrastructureModule,
      providers: [
        {
          provide: Infrastructure,
          useFactory: async () => {
            const infrastructure = new Infrastructure(infrastructureConfig);
            await infrastructure.initialize();
            return infrastructure;
          },
        },
        CacheService,
      ],
      exports: [Infrastructure, CacheService],
    };
  }
}