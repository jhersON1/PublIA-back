export interface ManagedAccount {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

export interface AccountsResponse {
  data: ManagedAccount[];
  paging?: { next?: string };
}
