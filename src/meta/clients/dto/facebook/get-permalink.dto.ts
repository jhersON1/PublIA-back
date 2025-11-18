import { IsNotEmpty, IsString } from 'class-validator';

export class GetPermalinkDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
