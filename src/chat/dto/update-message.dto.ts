import { IsString, IsEnum } from 'class-validator';

export class UpdateMessageDto {
    @IsEnum(['instagram', 'tiktok'], { message: 'Platform must be instagram or tiktok' })
    readonly platform: 'instagram' | 'tiktok';

    @IsString()
    readonly mediaUrl: string;
}
