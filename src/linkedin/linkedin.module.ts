import { Module } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { LinkedinController } from './linkedin.controller';
import { HttpModule } from '../http/http.module';
import { LinkedInClient } from './clients/linkedin.client';

@Module({
  imports: [HttpModule],
  controllers: [LinkedinController],
  providers: [LinkedinService, LinkedInClient],
})
export class LinkedinModule {}
