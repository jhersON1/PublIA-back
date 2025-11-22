import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { GptController } from './gpt.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { VideoGenerationUseCase } from './use-cases/videos/video-generation.use-case';
import { ImageGenerationUseCase } from './use-cases/images/image-generation.use-case';
import { ChatUseCase } from './use-cases/chat/chat.use-case';
import { GeneratePostsUseCase } from './use-cases/generate-posts/generate-posts.use-case';
import { HttpModule } from '../http/http.module';
import { GoogleImageGenerator } from './providers/google-image-generator.provider';
import { AzureOpenAiVideoGenerator } from './providers/azure-openai-video-generator.provider';

@Module({
  imports: [CloudinaryModule, HttpModule],
  controllers: [GptController],
  providers: [
    GptService,
    VideoGenerationUseCase,
    ImageGenerationUseCase,
    ChatUseCase,
    GeneratePostsUseCase,
    {
      provide: 'ImageGenerator',
      useClass: GoogleImageGenerator,
    },
    {
      provide: 'VideoGenerator',
      useClass: AzureOpenAiVideoGenerator,
    },
  ],
})
export class GptModule { }
