import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatTextDto } from './dto';
import { chatTextUseCase } from './use-cases';
import OpenAI from 'openai';


@Injectable()
export class GptService {
  
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });
  }

  async chatText(chatTextDto: ChatTextDto) {
    return await chatTextUseCase(this.openai, {
      prompt: chatTextDto.prompt
    });
  }
}
