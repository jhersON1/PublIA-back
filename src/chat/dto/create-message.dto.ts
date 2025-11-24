import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    readonly chatId: string;

    @IsString()
    @IsEnum(['user', 'ai'])
    readonly sender: string;

    @IsString()
    readonly content: string;

    @IsString()
    @IsEnum(['text', 'image', 'video'])
    @IsOptional()
    readonly type?: string;

    @IsString()
    @IsOptional()
    readonly mediaUrl?: string;

    @IsObject()
    @IsOptional()
    readonly metadata?: any;
}
