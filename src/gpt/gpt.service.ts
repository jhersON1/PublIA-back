import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTextDto, GeneratePostsDto, GenerateImageDto, GenerateImageUrlDto } from './dto';
import { chatUseCase, generatePostsUseCase, imageGenerationUseCase } from './use-cases';
import OpenAI from 'openai';


@Injectable()
export class GptService {
  
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
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
    return await imageGenerationUseCase(this.openai, {
      prompt: generateImageDto.prompt,
      previousResponseId: generateImageDto.previousResponseId
    });
  }

}
