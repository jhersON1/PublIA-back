import { InstagramClient } from '../../../clients/instagram.client';
import { PostResult } from '../shared/types';

interface Options {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption?: string;
}

// Helper function to add delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const postInstagramImageUseCase = async (
  instagram: InstagramClient,
  { igUserId, accessToken, imageUrl, caption }: Options,
): Promise<PostResult> => {
  // 1) Crear container de imagen
  const created = await instagram.createImageMedia({ igUserId, accessToken, imageUrl, caption });

  console.log(`✅ Container creado con ID: ${created.id}`);

  // 2) Esperar 4 segundos para que Instagram procese la imagen
  console.log('⏳ Esperando 4 segundos para que Instagram procese la imagen...');
  await sleep(4000);

  // 3) Publicar el container para crear el media
  console.log('📤 Publicando el container...');
  const published = await instagram.publishMedia({ igUserId, accessToken, creationId: created.id });
  console.log(`✅ Publicado exitosamente con ID: ${published.id}`);

  // 4) Obtener permalink (best-effort)
  let permalink: string | undefined;
  try {
    const meta = await instagram.getMediaPermalink({ mediaId: published.id, accessToken });
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

