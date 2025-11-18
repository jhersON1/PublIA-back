export type Platform = 'facebook' | 'instagram' | 'whatsapp' | 'linkedin';
export type ContentType = 'text' | 'image' | 'article';

export interface PostResult {
  ok: true;
  platform: Platform;
  id: string;
  permalink?: string;
  status: 'published';
}
