import { Module, Global } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { IndexingService } from './services/indexing.service';
import { MonitoringModule } from '@katarsaad/monitoring';
import { InfrastructureModule } from '@katarsaad/infrastructure';

@Global()
@Module({
  imports: [MonitoringModule.forRoot(), InfrastructureModule],
  providers: [SearchService, IndexingService],
  exports: [SearchService, IndexingService],
})
export class SearchModule {}