import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PostPageFeedDto {
  @IsString()
  @IsNotEmpty()
  pageId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @MinLength(1)
  message: string;
}
