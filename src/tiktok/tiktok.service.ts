import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTiktokDto } from './dto/create-tiktok.dto';
import { UpdateTiktokDto } from './dto/update-tiktok.dto';

@Injectable()
export class TiktokService {
  constructor(private readonly configService: ConfigService) {}

  getAuthorizeUrl(state?: string) {
    const clientKey = this.configService.get<string>('TIKTOK_CLIENT_KEY');
    const redirectUri = this.configService.get<string>('TIKTOK_REDIRECT_URI');
    const scopes = this.configService.get<string>('TIKTOK_SCOPES') || 'user.info.basic';

    const base = 'https://www.tiktok.com/v2/auth/authorize/';
    const params = new URLSearchParams({
      client_key: clientKey ?? '',
      response_type: 'code',
      scope: scopes,
      redirect_uri: redirectUri ?? '',
      state: state || Math.random().toString(36).slice(2),
    });
    return `${base}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string) {
    const clientKey = this.configService.get<string>('TIKTOK_CLIENT_KEY');
    const clientSecret = this.configService.get<string>('TIKTOK_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('TIKTOK_REDIRECT_URI');

    if (!clientKey || !clientSecret || !redirectUri) {
      throw new Error('Missing TikTok OAuth env vars (TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI)');
    }

    const tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
    const body = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const json = await resp.json();
    if (!resp.ok) {
      throw new Error(`TikTok token error: ${resp.status} ${resp.statusText} - ${JSON.stringify(json)}`);
    }
    return json;
  }
  create(createTiktokDto: CreateTiktokDto) {
    return 'This action adds a new tiktok';
  }

  findAll() {
    return `This action returns all tiktok`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tiktok`;
  }

  update(id: number, updateTiktokDto: UpdateTiktokDto) {
    return `This action updates a #${id} tiktok`;
  }

  remove(id: number) {
    return `This action removes a #${id} tiktok`;
  }
}
