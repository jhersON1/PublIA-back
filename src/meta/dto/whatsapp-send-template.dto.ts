import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class WhatsAppSendTemplateDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?\d+$/, { message: 'to must be a phone number in international format (e.g., 59172184204 or +59172184204)' })
  to: string;

  @IsNotEmpty()
  @IsString()
  templateName: string;

  @IsNotEmpty()
  @IsString()
  languageCode: string;
}
