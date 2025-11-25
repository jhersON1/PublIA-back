import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { TiktokModule } from '../tiktok/tiktok.module';
import { MetaModule } from '../meta/meta.module';
import { HttpModule } from '../http/http.module';
import { ChatModule } from '../chat/chat.module';

// Use Cases
import { ImageGenerationUseCase } from './use-cases/images/image-generation.use-case';
import { GeneratePostsUseCase } from './use-cases/generate-posts/generate-posts.use-case';
import { VideoGenerationUseCase } from './use-cases/videos/video-generation.use-case';
import { ChatUseCase } from './use-cases/chat/chat.use-case';
import { GoogleVideoGenerator } from './providers/google-video-generator.provider';
import { GoogleImageGenerator } from './providers/google-image-generator.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [GptController],
  providers: [
    GptService,
    ImageGenerationUseCase,
    GeneratePostsUseCase,
    VideoGenerationUseCase,
    ChatUseCase,
    GoogleVideoGenerator,
    GoogleImageGenerator,
    {
      provide: 'VideoGenerator',
      useExisting: GoogleVideoGenerator
    },
    {
      provide: 'ImageGenerator',
      useExisting: GoogleImageGenerator
    }
  ],
  imports: [
    CloudinaryModule,
    TiktokModule,
    MetaModule,
    HttpModule,
    ConfigModule,
    ChatModule
  ],
  exports: [GptService]
})
export class GptModule { }
