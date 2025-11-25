import { IsOptional, IsString } from 'class-validator';

export class GenerateImageUrlDto {

  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly previousResponseId?: string;

  @IsString()
  @IsOptional()
  readonly chatId?: string;

  @IsString()
  @IsOptional()
  readonly messageId?: string;
}
