import { Controller, Post, Body } from '@nestjs/common';
import { GptService } from './gpt.service';
import { ChatTextDto, GeneratePostsDto } from './dto';


@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('chat')
  chat (
    @Body() chatTextDto: ChatTextDto
  ) {
    return this.gptService.chat(chatTextDto);
  }

  @Post('generate-posts')
  generatePosts (
    @Body() generatePostsDto: GeneratePostsDto
  ) {
    return this.gptService.generatePosts(generatePostsDto);
  }
}
