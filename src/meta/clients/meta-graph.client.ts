import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { MetaException } from '../exceptions/meta.exceptions';
import { getMetaGraphBaseUrl } from '../constan-url/meta.urls';

export interface ManagedAccount {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

interface AccountsResponse {
  data: ManagedAccount[];
  paging?: { next?: string };
}

@Injectable()
export class MetaGraphClient {
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.baseUrl = getMetaGraphBaseUrl(this.config);
  }

  /**
   * Lista las páginas administradas por el usuario con su access_token
   * y, si existe, el instagram_business_account vinculado.
   */
  async listManagedAccounts(userAccessToken: string): Promise<ManagedAccount[]> {
    const fields = 'id,name,access_token,instagram_business_account';
    const url = `${this.baseUrl}/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(
      userAccessToken,
    )}`;
    try {
      const res = await this.http.get<AccountsResponse>(url);
      return res?.data ?? [];
    } catch (e: any) {
      MetaException.graphApi('Meta Graph API error (list accounts)', e.body || e.message, e.status);
    }
  }
}
