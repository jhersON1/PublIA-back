import { Controller, Post, Body } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { LinkedInPostArticleDto } from './dto/post-article.dto';
import { PostResult } from './use-cases/publish/shared/types';

@Controller('linkedin')
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Post('post-article')
  postArticle(@Body() linkedinPostArticleDto: LinkedInPostArticleDto): Promise<PostResult> {
    return this.linkedinService.postArticle(linkedinPostArticleDto);
  }
}
