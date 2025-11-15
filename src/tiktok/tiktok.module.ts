import { Module } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { TiktokController } from './tiktok.controller';
import { TiktokAuthController } from './tiktok.auth.controller';

@Module({
  controllers: [TiktokController, TiktokAuthController],
  providers: [TiktokService],
})
export class TiktokModule {}
