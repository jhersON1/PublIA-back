import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl, getInstagramMediaUrl, getInstagramMediaPublishUrl, getInstagramPermalinkUrl } from '../constan-url/meta.urls';
import { CreateImageMediaDto, PublishMediaDto, GetMediaPermalinkDto } from './dto/instagram';
import { InstagramMediaResponse, InstagramPermalinkResponse } from './interfaces/instagram.interface';

@Injectable()
export class InstagramClient {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
  }

  async createImageMedia(createImageMediaDto: CreateImageMediaDto): Promise<InstagramMediaResponse> {
    const url = getInstagramMediaUrl(this.baseUrl, createImageMediaDto.igUserId);
    const params: Record<string, string> = {
      image_url: createImageMediaDto.imageUrl,
      access_token: createImageMediaDto.accessToken,
    };

    if (createImageMediaDto.caption) params.caption = createImageMediaDto.caption;

    const body = new URLSearchParams(params);

    try {
      return await this.http.request<InstagramMediaResponse>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (e: any) {
      MetaException.graphApi('Instagram Graph API error (create media)', e.body || e.message, e.status);
    }
  }

  async publishMedia(publishMediaDto: PublishMediaDto): Promise<InstagramMediaResponse> {
    const url = getInstagramMediaPublishUrl(this.baseUrl, publishMediaDto.igUserId);
    const body = new URLSearchParams({
      creation_id: publishMediaDto.creationId,
      access_token: publishMediaDto.accessToken,
    });

    try {
      return await this.http.request<InstagramMediaResponse>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (e: any) {
      MetaException.graphApi('Instagram Graph API error (publish)', e.body || e.message, e.status);
    }
  }

  async getMediaPermalink(getMediaPermalinkDto: GetMediaPermalinkDto): Promise<InstagramPermalinkResponse> {
    const url = getInstagramPermalinkUrl(this.baseUrl, getMediaPermalinkDto.mediaId, getMediaPermalinkDto.accessToken);

    try {
      return await this.http.request<InstagramPermalinkResponse>(url, { method: 'GET' });
    } catch (e: any) {
      MetaException.graphApi('Instagram Graph API error (permalink)', e.body || e.message, e.status);
    }
  }
}
