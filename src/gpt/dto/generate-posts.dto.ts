import { IsString } from 'class-validator';

export class GeneratePostsDto {
  @IsString()
  readonly prompt: string;
}
