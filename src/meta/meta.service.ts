import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookPostTextDto } from './dto/facebook-post-text.dto';
import { InstagramPostImageDto } from './dto/instagram-post-image.dto';
import { WhatsAppSendTemplateDto } from './dto/whatsapp-send-template.dto';
import { MetaGraphClient } from './clients/meta-graph.client';
import { ManagedAccount } from './clients/interfaces/meta-graph.interface';
import { PostResult } from './use-cases/publish/shared/types';
import { postFacebookTextUseCase } from './use-cases/publish/facebook/post-text.use-case';
import { postInstagramImageUseCase } from './use-cases/publish/instagram/post-image.use-case';
import { sendWhatsAppTemplateUseCase } from './use-cases/publish/whatsapp/send-template.use-case';
import { MetaException } from './exceptions/meta.exceptions';
import { FacebookClient } from './clients/facebook.client';
import { InstagramClient } from './clients/instagram.client';
import { WhatsAppClient } from './clients/whatsapp.client';

@Injectable()
export class MetaService {
  constructor(
    private readonly config: ConfigService,
    private readonly graph: MetaGraphClient,
    private readonly facebook: FacebookClient,
    private readonly instagram: InstagramClient,
    private readonly whatsapp: WhatsAppClient,
  ) { }

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

  /**
   * Envía un mensaje de template de WhatsApp
   * @param dto - Datos del mensaje (destinatario, nombre del template, código de idioma)
   * @returns Resultado con el ID del mensaje enviado
   */
  async sendWhatsAppTemplate(dto: WhatsAppSendTemplateDto): Promise<PostResult> {
    return await sendWhatsAppTemplateUseCase(this.whatsapp, {
      to: dto.to,
      templateName: dto.templateName,
      languageCode: dto.languageCode,
    });
  }

  /**
   * Envía un mensaje de texto simple por WhatsApp
   * @param to - Número de teléfono del destinatario
   * @param text - Contenido del mensaje
   * @param previewUrl - Si se debe mostrar preview de URLs
   * @returns Resultado con el ID del mensaje enviado
   */
  async sendWhatsAppText(to: string, text: string, previewUrl: boolean): Promise<PostResult> {
    const response = await this.whatsapp.sendTextMessage(to, text, previewUrl);
    return {
      ok: true,
      platform: 'whatsapp',
      id: response.messages[0]?.id,
      status: 'published',
    };
  }

  private async resolveSingleAccount(userToken: string): Promise<ManagedAccount> {
    const accounts = await this.graph.listManagedAccounts({ userAccessToken: userToken });
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
