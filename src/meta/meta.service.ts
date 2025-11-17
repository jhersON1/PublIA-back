import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookPostTextDto } from './dto/facebook-post-text.dto';
import { InstagramPostImageDto } from './dto/instagram-post-image.dto';
import { MetaGraphClient, ManagedAccount } from './clients/meta-graph.client';
import { PostResult } from './use-cases/publish/shared/types';
import { postFacebookTextUseCase } from './use-cases/publish/facebook/post-text.use-case';
import { postInstagramImageUseCase } from './use-cases/publish/instagram/post-image.use-case';
import { MetaException } from './exceptions/meta.exceptions';
import { FacebookClient } from './clients/facebook.client';
import { InstagramClient } from './clients/instagram.client';

@Injectable()
export class MetaService {
  constructor(
    private readonly config: ConfigService,
    private readonly graph: MetaGraphClient,
    private readonly facebook: FacebookClient,
    private readonly instagram: InstagramClient,
  ) {}

  async postFacebookText(dto: FacebookPostTextDto): Promise<PostResult> {
    const userToken = this.config.get<string>('meta_user_access_token');
    if (!userToken) MetaException.missingEnv('meta_user_access_token');

    const account = await this.resolveSingleAccount(userToken);

    return await postFacebookTextUseCase(this.facebook, {
      pageId: account.id,
      accessToken: account.access_token,
      message: dto.text,
    });
  }

  async postInstagramImage(dto: InstagramPostImageDto): Promise<PostResult> {
    const userToken = this.config.get<string>('meta_user_access_token');
    if (!userToken) MetaException.missingEnv('meta_user_access_token');

    const account = await this.resolveSingleAccount(userToken);

    const ig = account.instagram_business_account?.id;
    if (!ig) {
      MetaException.validation(
        'The resolved Facebook Page has no linked instagram_business_account. Cannot publish to Instagram.',
      );
    }

    return await postInstagramImageUseCase(this.instagram, {
      igUserId: ig,
      accessToken: account.access_token,
      imageUrl: dto.imageUrl,
      caption: dto.caption,
    });
  }

  private async resolveSingleAccount(userToken: string): Promise<ManagedAccount> {
    const accounts = await this.graph.listManagedAccounts(userToken);
    if (!accounts || accounts.length === 0) {
      MetaException.validation('No Facebook Page found for the provided meta_user_access_token');
    }
    if (accounts.length > 1) {
      MetaException.validation(
        'Multiple Facebook Pages found for this token; current scope requires exactly one page. Please restrict the token or implement selection.',
      );
    }
    return accounts[0]!;
  }
}
