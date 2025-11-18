import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

export class LinkedInPostArticleDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsUrl()
  articleUrl: string;

  @IsNotEmpty()
  @IsString()
  articleTitle: string;

  @IsOptional()
  @IsString()
  articleDescription?: string;
}
