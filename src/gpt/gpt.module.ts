import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { VideoGenerationUseCase } from './use-cases/videos/video-generation.use-case';
import { HttpModule } from '../http/http.module';

@Module({
  imports: [CloudinaryModule, HttpModule],
  controllers: [GptController],
  providers: [GptService, VideoGenerationUseCase],
})
export class GptModule { }
