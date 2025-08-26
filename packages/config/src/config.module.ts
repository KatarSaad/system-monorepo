import { Module, Global } from '@nestjs/common';
import { ConfigService } from './services/config.service';
import { ConfigValidationService } from './services/config-validation.service';
// import { ValidationModule } from '@katarsaad/validation';

@Global()
@Module({
  imports: [],
  providers: [ConfigService, ConfigValidationService],
  exports: [ConfigService, ConfigValidationService],
})
export class ConfigModule {}