import { IsOptional, IsString } from 'class-validator';

export class ChatTextDto {

  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly previousResponseId?: string;

  @IsString()
  @IsOptional()
  readonly chatId?: string;
}