import { InstagramClient } from '../../../clients/instagram.client';
import { MetaException } from '../../../exceptions/meta.exceptions';
import { PostResult } from '../shared/types';

interface Options {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption?: string;
}

export const postInstagramImageUseCase = async (
  instagram: InstagramClient,
  { igUserId, accessToken, imageUrl, caption }: Options,
): Promise<PostResult> => {
  // 1) Crear container de imagen
  const created = await instagram.createImageMedia(igUserId, accessToken, imageUrl, caption);

  // 2) Publicar el container para crear el media
  const published = await instagram.publishMedia(igUserId, accessToken, created.id);

  // 3) Obtener permalink (best-effort)
  let permalink: string | undefined;
  try {
    const meta = await instagram.getMediaPermalink(published.id, accessToken);
    permalink = meta?.permalink;
  } catch {
    // ignore permalink failures
  }

  const result: PostResult = {
    ok: true,
    platform: 'instagram',
    id: published.id,
    permalink,
    status: 'published',
  };
  return result;
};
