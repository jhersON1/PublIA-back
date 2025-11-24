import { IsOptional, IsString } from 'class-validator';

export class UpdateChatDto {
    @IsString()
    @IsOptional()
    readonly title?: string;
}
