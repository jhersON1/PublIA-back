import { IsNotEmpty, IsString } from 'class-validator';

export class PublishMediaDto {
  @IsString()
  @IsNotEmpty()
  igUserId: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  creationId: string;
}
