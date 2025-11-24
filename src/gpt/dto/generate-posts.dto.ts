import { IsString, IsOptional } from 'class-validator';

export class GeneratePostsDto {
  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly chatId?: string;
}
