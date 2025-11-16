import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookPostTextDto } from './dto/facebook-post-text.dto';
import { MetaGraphClient } from './clients/meta-graph.client';
import { PostResult } from './use-cases/publish/shared/types';
import { postFacebookTextUseCase } from './use-cases/publish/facebook/post-text.use-case';
import { MetaException } from './exceptions/meta.exceptions';

@Injectable()
export class MetaService {
  constructor(
    private readonly config: ConfigService,
    private readonly graph: MetaGraphClient,
  ) {}

  async postFacebookText(dto: FacebookPostTextDto): Promise<PostResult> {
    const pageId = this.config.get<string>('FACEBOOK_PAGE_ID');
    const accessToken = this.config.get<string>('FACEBOOK_PAGE_ACCESS_TOKEN');

    if (!pageId) MetaException.missingEnv('FACEBOOK_PAGE_ID');
    if (!accessToken) MetaException.missingEnv('FACEBOOK_PAGE_ACCESS_TOKEN');

    return await postFacebookTextUseCase(this.graph, {
      pageId,
      accessToken,
      message: dto.text,
    });
  }
}
