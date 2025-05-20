import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ExecuteShardingSQLHandler } from './sharding/execute-sql-sharding.command';
import { GetShardingByIndexQueryHandler } from './sharding/get-sharding-config.query';

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [ExecuteShardingSQLHandler, GetShardingByIndexQueryHandler],
  controllers: [AppController],
})
export class AppModule {}
