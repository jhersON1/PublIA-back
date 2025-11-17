export type Platform = 'facebook' | 'instagram' | 'whatsapp';
export type ContentType = 'text' | 'image';

export interface PostResult {
  ok: true;
  platform: Platform;
  id: string;
  permalink?: string;
  status: 'published';
}
