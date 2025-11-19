import { IsOptional, IsString } from 'class-validator';

export class GenerateVideoDto {

  @IsString()
  readonly prompt: string;

  @IsString()
  @IsOptional()
  readonly previousResponseId?: string;
}
