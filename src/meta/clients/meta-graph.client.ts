import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl } from '../constan-url/meta.urls';

@Injectable()
export class MetaGraphClient {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
  }

  async postPageFeedMessage(pageId: string, accessToken: string, message: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(pageId)}/feed`;
    const body = new URLSearchParams({
      message,
      access_token: accessToken,
    });
    try {
      return await this.http.request<{ id: string }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (e: any) {
      MetaException.graphApi('Facebook Graph API error (feed)', e.body || e.message, e.status);
    }
  }

  async getPermalink(postId: string, accessToken: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(postId)}?fields=permalink_url&access_token=${encodeURIComponent(
      accessToken,
    )}`;
    try {
      return await this.http.request<{ permalink_url?: string }>(url, { method: 'GET' });
    } catch (e: any) {
      MetaException.graphApi('Facebook Graph API error (permalink)', e.body || e.message, e.status);
    }
  }
}
