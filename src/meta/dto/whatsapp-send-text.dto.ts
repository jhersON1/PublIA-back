import { IsNotEmpty, IsString, IsBoolean, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WhatsAppTextBody {
    @IsBoolean()
    preview_url: boolean;

    @IsNotEmpty()
    @IsString()
    body: string;
}

export class WhatsAppSendTextDto {
    @IsNotEmpty()
    @IsString()
    messaging_product: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+?\d+$/, { message: 'to must be a phone number in international format (e.g., 59172184204 or +59172184204)' })
    to: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @ValidateNested()
    @Type(() => WhatsAppTextBody)
    text: WhatsAppTextBody;
}
