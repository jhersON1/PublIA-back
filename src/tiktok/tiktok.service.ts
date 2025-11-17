import { Injectable } from '@nestjs/common';
import { TikTokAuthClient, TokenResponse } from './clients/tiktok-auth.client';

@Injectable()
export class TiktokService {
  constructor(private readonly authClient: TikTokAuthClient) {}

  getAuthorizeUrl(state?: string): string {
    return this.authClient.getAuthorizeUrl(state);
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    return await this.authClient.exchangeCodeForToken(code);
  }
}
