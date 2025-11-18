import { Controller, Post, Body } from '@nestjs/common';
import { MetaService } from './meta.service';
import { FacebookPostTextDto } from './dto/facebook-post-text.dto';
import { InstagramPostImageDto } from './dto/instagram-post-image.dto';
import { WhatsAppSendTemplateDto } from './dto/whatsapp-send-template.dto';
import { PostResult } from './use-cases/publish/shared/types';

@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Post('facebook/post-text')
  postFacebookText(@Body() dto: FacebookPostTextDto): Promise<PostResult> {
    return this.metaService.postFacebookText(dto);
  }

  @Post('instagram/post-image')
  postInstagramImage(@Body() dto: InstagramPostImageDto): Promise<PostResult> {
    return this.metaService.postInstagramImage(dto);
  }

  @Post('whatsapp/send-template')
  sendWhatsAppTemplate(@Body() dto: WhatsAppSendTemplateDto): Promise<PostResult> {
    return this.metaService.sendWhatsAppTemplate(dto);
  }
}
