import { Module, Global, DynamicModule } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  }


}