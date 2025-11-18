import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl } from '../constan-url/meta.urls';
import { ListManagedAccountsDto } from './dto/meta-graph';
import { ManagedAccount, AccountsResponse } from './interfaces/meta-graph.interface';

@Injectable()
export class MetaGraphClient {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
  }

  async listManagedAccounts(listManagedAccountsDto: ListManagedAccountsDto): Promise<ManagedAccount[]> {
    const fields = 'id,name,access_token,instagram_business_account';
    const url = `${this.baseUrl}/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(
      listManagedAccountsDto.userAccessToken,
    )}`;
    
    try {
      const res = await this.http.get<AccountsResponse>(url);
      return res?.data ?? [];
    } catch (e: any) {
      MetaException.graphApi('Meta Graph API error (list accounts)', e.body || e.message, e.status);
    }
  }
}
