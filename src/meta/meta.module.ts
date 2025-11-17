import { Module } from '@nestjs/common';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { MetaGraphClient } from './clients/meta-graph.client';
import { HttpModule } from '../http/http.module';
import { FacebookClient } from './clients/facebook.client';
import { InstagramClient } from './clients/instagram.client';

@Module({
  imports: [HttpModule],
  controllers: [MetaController],
  providers: [MetaService, MetaGraphClient, FacebookClient, InstagramClient],
})
export class MetaModule {}
