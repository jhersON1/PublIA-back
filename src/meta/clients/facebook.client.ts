import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl, getFacebookPageFeedUrl, getFacebookPermalinkUrl } from '../constan-url/meta.urls';
import { PostPageFeedDto, GetPermalinkDto } from './dto/facebook';
import { FacebookPostResponse, FacebookPermalinkResponse } from './interfaces/facebook.interface';

@Injectable()
export class FacebookClient {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
  }

  async postPageFeedMessage(postPageFeedDto: PostPageFeedDto): Promise<FacebookPostResponse> {
    const url = getFacebookPageFeedUrl(this.baseUrl, postPageFeedDto.pageId);
    const body = new URLSearchParams({
      message: postPageFeedDto.message,
      access_token: postPageFeedDto.accessToken,
    });

    try {
      return await this.http.request<FacebookPostResponse>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (e: any) {
      MetaException.graphApi('Facebook Graph API error (feed)', e.body || e.message, e.status);
    }
  }

  async getPermalink(getPermalinkDto: GetPermalinkDto): Promise<FacebookPermalinkResponse> {
    const url = getFacebookPermalinkUrl(this.baseUrl, getPermalinkDto.postId, getPermalinkDto.accessToken);

    try {
      return await this.http.request<FacebookPermalinkResponse>(url, { method: 'GET' });
    } catch (e: any) {
      MetaException.graphApi('Facebook Graph API error (permalink)', e.body || e.message, e.status);
    }
  }
}

