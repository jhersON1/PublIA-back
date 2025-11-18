export interface TemplateLanguage {
  code: string;
}

export interface Template {
  name: string;
  language: TemplateLanguage;
}

export interface SendTemplateMessageRequest {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: Template;
}

export interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}
