import { IsOptional, IsString } from 'class-validator';

export class GenerateImageDto {

  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly previousResponseId?: string;
}
