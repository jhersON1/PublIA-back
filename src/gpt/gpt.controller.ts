import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import { ChatTextDto, GeneratePostsDto, GenerateImageDto, GenerateVideoDto } from './dto';
import type { Response } from 'express';
import * as path from 'path';


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

  @Post('generate-image')
  generateImage (
    @Body() generateImageDto: GenerateImageDto
  ) {
    return this.gptService.generateImage(generateImageDto);
  }

  @Post('generate-video')
  generateVideo (
    @Body() generateVideoDto: GenerateVideoDto
  ) {
    return this.gptService.generateVideo(generateVideoDto);
  }

  @Get('video/:filename')
  getVideo(
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const filePath = path.join(process.cwd(), 'generated', 'videos', filename);
    return res.sendFile(filePath);
  }

}
