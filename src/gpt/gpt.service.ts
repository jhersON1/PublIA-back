import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTextDto, GeneratePostsDto, GenerateImageDto, GenerateVideoDto } from './dto';
import { chatUseCase, generatePostsUseCase, imageGenerationUseCase, videoGenerationUseCase } from './use-cases';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import OpenAI from 'openai';


@Injectable()
export class GptService {
  
  private openai: OpenAI;
  private azureOpenai: OpenAI;

  constructor(
    private configService: ConfigService,
    private cloudinaryService: CloudinaryService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });

    const azureApiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    const azureEndpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    const deploymentName = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT_NAME') || 'sora-2';
    
    console.log('🔑 Azure OpenAI Config:', {
      hasApiKey: !!azureApiKey,
      endpoint: azureEndpoint,
      deploymentName: deploymentName,
      fullURL: `${azureEndpoint}/openai/deployments/${deploymentName}`
    });

    // Configuración para Azure OpenAI con deployment específico
    this.azureOpenai = new OpenAI({
      apiKey: azureApiKey,
      baseURL: `${azureEndpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: { 'api-version': '2024-12-01-preview' },
      defaultHeaders: { 'api-key': azureApiKey }
    });
  }

  async chat(chatTextDto: ChatTextDto) {
    return await chatUseCase(this.openai, {
      prompt: chatTextDto.prompt,
      previousResponseId: chatTextDto.previousResponseId
    });
  }

  async generatePosts(generatePostsDto: GeneratePostsDto) {
    return await generatePostsUseCase(this.openai, {
      prompt: generatePostsDto.prompt
    });
  }

  async generateImage(generateImageDto: GenerateImageDto) {
    return await imageGenerationUseCase(this.openai, this.cloudinaryService, {
      prompt: generateImageDto.prompt,
      previousResponseId: generateImageDto.previousResponseId
    });
  }

  async generateVideo(generateVideoDto: GenerateVideoDto) {
    // NOTA: Sora podría no estar disponible en Azure OpenAI todavía
    // Si falla, intentar con OpenAI directamente
    return await videoGenerationUseCase(this.openai, this.cloudinaryService, {
      prompt: generateVideoDto.prompt,
      previousResponseId: generateVideoDto.previousResponseId
    });
  }

}
