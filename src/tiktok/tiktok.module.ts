import { Module } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { TiktokController } from './tiktok.controller';
import { TiktokAuthController } from './tiktok.auth.controller';
import { HttpModule } from '../http/http.module';
import { TikTokAuthClient } from './clients/tiktok-auth.client';
import { TikTokVideoUploadService } from './use-cases/tiktok-video-upload.service';

@Module({
  imports: [HttpModule],
  controllers: [TiktokController, TiktokAuthController],
  providers: [TiktokService, TikTokAuthClient, TikTokVideoUploadService],
})
export class TiktokModule { }
