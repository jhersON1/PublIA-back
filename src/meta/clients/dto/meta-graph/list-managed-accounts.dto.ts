import { IsNotEmpty, IsString } from 'class-validator';

export class ListManagedAccountsDto {
  @IsString()
  @IsNotEmpty()
  userAccessToken: string;
}
