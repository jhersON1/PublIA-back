import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { MetaGraphClient } from './clients/meta-graph.client';
import { HttpClient } from './clients/http.client';

@Module({
  controllers: [MetaController],
  providers: [MetaService, HttpClient, MetaGraphClient],
})
export class MetaModule {}
