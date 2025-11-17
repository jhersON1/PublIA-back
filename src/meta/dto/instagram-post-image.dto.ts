import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class InstagramPostImageDto {
  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  caption?: string;
}

