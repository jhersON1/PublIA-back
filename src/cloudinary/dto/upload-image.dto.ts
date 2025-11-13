import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadImageDto {

  @IsString()
  @IsNotEmpty()
  readonly base64Image: string;

  @IsString()
  @IsOptional()
  readonly folder?: string;
}
