import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
    @IsString()
    readonly userId: string;

    @IsString()
    @IsOptional()
    readonly title?: string;
}
