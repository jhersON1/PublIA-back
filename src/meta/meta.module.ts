import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { MetaGraphClient } from './clients/meta-graph.client';
import { HttpModule } from '../http/http.module';

@Module({
  imports: [HttpModule],
  controllers: [MetaController],
  providers: [MetaService, MetaGraphClient],
})
export class MetaModule {}
