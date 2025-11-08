import { Controller, Post, Body } from '@nestjs/common';
import { GptService } from './gpt.service';
import { ChatTextDto } from './dto';


@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('chat-text')
  chatText (
    @Body() chatTextDto: ChatTextDto
  ) {
    return this.gptService.chatText(chatTextDto);
  }
}
