import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl } from '../constan-url/meta.urls';

interface TemplateLanguage {
  code: string;
}

interface Template {
  name: string;
  language: TemplateLanguage;
}

interface SendTemplateMessageRequest {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: Template;
}

interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

@Injectable()
export class WhatsAppClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
    this.accessToken = this.config.get<string>('WHATSAPP_TOKEN') || '';
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.accessToken) MetaException.missingEnv('WHATSAPP_TOKEN');
    if (!this.phoneNumberId) MetaException.missingEnv('WHATSAPP_PHONE_NUMBER_ID');
  }

  /**
   * Envía un mensaje de template de WhatsApp a un número de teléfono
   * @param to - Número de teléfono destino (formato internacional sin +, ej: "59172184204")
   * @param templateName - Nombre del template aprobado en WhatsApp Business
   * @param languageCode - Código de idioma del template (ej: "en_US", "es_ES")
   * @returns Respuesta con el ID del mensaje enviado
   */
  async sendTemplateMessage(to: string, templateName: string, languageCode: string) {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

    const body: SendTemplateMessageRequest = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    try {
      return await this.http.postJson<SendMessageResponse>(url, body, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (e: any) {
      MetaException.graphApi('WhatsApp Graph API error (send template)', e.body || e.message, e.status);
    }
  }
}
