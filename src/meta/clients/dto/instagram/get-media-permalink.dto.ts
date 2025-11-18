import { IsNotEmpty, IsString } from 'class-validator';

export class GetMediaPermalinkDto {
  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
