import { IsString, MinLength } from 'class-validator';

export class FacebookPostTextDto {
  @IsString()
  @MinLength(1)
  text: string;
}

