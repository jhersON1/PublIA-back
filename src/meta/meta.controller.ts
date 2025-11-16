import { Controller, Post, Body } from '@nestjs/common';
import { MetaService } from './meta.service';
import { FacebookPostTextDto } from './dto/facebook-post-text.dto';
import { PostResult } from './use-cases/publish/shared/types';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Post('facebook/post-text')
  postFacebookText(@Body() dto: FacebookPostTextDto): Promise<PostResult> {
    return this.metaService.postFacebookText(dto);
  }
}
