import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TiktokService } from './tiktok.service';

@Controller('auth/tiktok')
export class TiktokAuthController {
  constructor(private readonly tiktokService: TiktokService) {}

  @Get('login')
  async login(@Query('state') state: string | undefined, @Res() res: Response) {
    const url = this.tiktokService.getAuthorizeUrl(state);
    console.log('[TikTok Login] redirecting to:', url);
    return res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    console.log('[TikTok Callback] query:', { code, state, error, error_description: errorDescription });

    if (error) {
      return res.status(400).json({ ok: false, error, error_description: errorDescription });
    }

    if (!code) {
      return res.status(400).json({ ok: false, message: 'Missing code parameter' });
    }

    try {
      const tokens = await this.tiktokService.exchangeCodeForToken(code);
      console.log('[TikTok Tokens]', tokens);
      return res.status(200).json({ ok: true, message: 'Login OK. Revisa la consola del servidor para ver las credenciales.' });
    } catch (e: any) {
      console.error('[TikTok Token Exchange Error]', e?.message || e);
      return res.status(500).json({ ok: false, message: 'Token exchange failed', error: e?.message || String(e) });
    }
  }
}

