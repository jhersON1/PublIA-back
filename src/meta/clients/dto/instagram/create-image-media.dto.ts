import { IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateImageMediaDto {
  @IsString()
  @IsNotEmpty()
  igUserId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  caption?: string;
}
