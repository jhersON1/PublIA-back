import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl } from '../constan-url/meta.urls';

@Injectable()
export class InstagramClient {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
  }

  // Crear container de imagen
  async createImageMedia(igUserId: string, accessToken: string, imageUrl: string, caption?: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(igUserId)}/media`;
    const params: Record<string, string> = {
      image_url: imageUrl,
      access_token: accessToken,
    };
    if (caption) params.caption = caption;

    const body = new URLSearchParams(params);
    try {
      return await this.http.request<{ id: string }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (e: any) {
      MetaException.graphApi('Instagram Graph API error (create media)', e.body || e.message, e.status);
    }
  }

  // Publicar container creado
  async publishMedia(igUserId: string, accessToken: string, creationId: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(igUserId)}/media_publish`;
    const body = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });
    try {
      return await this.http.request<{ id: string }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (e: any) {
      MetaException.graphApi('Instagram Graph API error (publish)', e.body || e.message, e.status);
    }
  }

  // Obtener permalink del media publicado
  async getMediaPermalink(mediaId: string, accessToken: string) {
    const url = `${this.baseUrl}/${encodeURIComponent(mediaId)}?fields=permalink&access_token=${encodeURIComponent(
      accessToken,
    )}`;
    try {
      return await this.http.request<{ permalink?: string }>(url, { method: 'GET' });
    } catch (e: any) {
      MetaException.graphApi('Instagram Graph API error (permalink)', e.body || e.message, e.status);
    }
  }
}

