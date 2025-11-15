import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GptModule } from './gpt/gpt.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TiktokModule } from './tiktok/tiktok.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GptModule,
    CloudinaryModule,
    TiktokModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
