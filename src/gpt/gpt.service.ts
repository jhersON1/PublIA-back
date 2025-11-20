import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTextDto, GeneratePostsDto, GenerateImageDto, GenerateVideoDto } from './dto';
import { ChatUseCase } from './use-cases/chat/chat.use-case';
import { GeneratePostsUseCase } from './use-cases/generate-posts/generate-posts.use-case';
import { VideoGenerationUseCase } from './use-cases/videos/video-generation.use-case';
import { ImageGenerationUseCase } from './use-cases/images/image-generation.use-case';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import OpenAI from 'openai';


@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);

  private openai: OpenAI;
  private azureOpenai: OpenAI;

  constructor(
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService,
    private videoGenerationUseCase: VideoGenerationUseCase,
    private imageGenerationUseCase: ImageGenerationUseCase,
    private chatUseCase: ChatUseCase,
    private generatePostsUseCase: GeneratePostsUseCase,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });

    const azureApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    const azureEndpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');

    // Configuración para Azure OpenAI
    this.azureOpenai = new OpenAI({
      apiKey: azureApiKey,
      baseURL: azureEndpoint,
      defaultQuery: { 'api-version': '2024-05-01-preview' },
      defaultHeaders: { 'api-key': azureApiKey }
    });
  }

  async chat(chatTextDto: ChatTextDto) {
    return await this.chatUseCase.execute(this.openai, chatTextDto);
  }

  async generatePosts(generatePostsDto: GeneratePostsDto) {
    return await this.generatePostsUseCase.execute(this.openai, generatePostsDto);
  }

  async generateImage(generateImageDto: GenerateImageDto) {
    return await this.imageGenerationUseCase.execute(this.openai, generateImageDto);
  }

  async generateVideo(generateVideoDto: GenerateVideoDto) {
    return await this.videoGenerationUseCase.execute(this.azureOpenai, generateVideoDto);
  }

}
