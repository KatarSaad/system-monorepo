import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { EventBusService } from './services/event-bus.service';
import { CryptoService } from './services/crypto.service';
import { ICacheService } from './interfaces/cache.interface';

export interface CoreModuleOptions {
  cache?: {
    ttl?: number;
    maxSize?: number;
    cleanupInterval?: number;
  };
}

@Global()
@Module({})
export class CoreModule {
  static forRoot(options?: CoreModuleOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: 'CORE_OPTIONS',
          useValue: options || {},
        },
        {
          provide: 'ICacheService',
          useClass: CacheService,
        },
        CacheService,
        EventBusService,
        CryptoService,
      ],
      exports: [
        'ICacheService',
        CacheService,
        EventBusService,
        CryptoService,
      ],
    };
  }
}