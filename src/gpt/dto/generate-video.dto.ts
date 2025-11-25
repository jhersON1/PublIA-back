import { IsOptional, IsString } from 'class-validator';

export class GenerateVideoDto {

  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly previousResponseId?: string;

  @IsOptional()
  readonly height?: number;

  @IsOptional()
  readonly width?: number;

  @IsOptional()
  readonly n_seconds?: number;

  @IsOptional()
  readonly n_variants?: number;

  @IsString()
  @IsOptional()
  readonly chatId?: string;

  @IsString()
  @IsOptional()
  readonly messageId?: string;
}
