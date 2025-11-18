import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { TikTokException } from '../exceptions/tiktok.exceptions';
import { TIKTOK_AUTH_BASE_URL, TIKTOK_TOKEN_URL, DEFAULT_TIKTOK_SCOPES } from '../config/tiktok.urls';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  open_id?: string;
}

@Injectable()
export class TikTokAuthClient {
  private readonly clientKey: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.clientKey = this.config.get<string>('TIKTOK_CLIENT_KEY') || '';
    this.clientSecret = this.config.get<string>('TIKTOK_CLIENT_SECRET') || '';
    this.redirectUri = this.config.get<string>('TIKTOK_REDIRECT_URI') || '';
    this.scopes = this.config.get<string>('TIKTOK_SCOPES') || DEFAULT_TIKTOK_SCOPES;

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.clientKey) TikTokException.missingEnv('TIKTOK_CLIENT_KEY');
    if (!this.clientSecret) TikTokException.missingEnv('TIKTOK_CLIENT_SECRET');
    if (!this.redirectUri) TikTokException.missingEnv('TIKTOK_REDIRECT_URI');
  }

  /**
   * Genera la URL de autorización de TikTok para iniciar el flujo OAuth
   */
  getAuthorizeUrl(state?: string): string {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      response_type: 'code',
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state: state || Math.random().toString(36).slice(2),
    });
    return `${TIKTOK_AUTH_BASE_URL}?${params.toString()}`;
  }

  /**
   * Intercambia el código de autorización por un access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      return await this.http.postForm<TokenResponse>(TIKTOK_TOKEN_URL, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      });
    } catch (e: any) {
      TikTokException.apiError('Failed to exchange code for token', e.body || e.message, e.status);
    }
  }
}
