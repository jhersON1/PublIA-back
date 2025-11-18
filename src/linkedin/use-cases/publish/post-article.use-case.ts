import { LinkedInClient } from '../../clients/linkedin.client';
import { PostResult } from './shared/types';
import { LinkedInPostArticleDto } from '../../dto/post-article.dto';

/**
 * Caso de uso para publicar un artículo en LinkedIn
 * @param linkedin - Cliente de LinkedIn para interactuar con la API
 * @param dto - Datos del artículo a publicar
 * @returns Resultado de la publicación con información del post creado
 */
export const postLinkedInArticleUseCase = async (
  linkedin: LinkedInClient,
  dto: LinkedInPostArticleDto,
): Promise<PostResult> => {
  const { text, articleUrl, articleTitle, articleDescription } = dto;
  // 1) Obtener información del usuario para construir el URN del autor
  const userInfo = await linkedin.getUserInfo();
  const authorUrn = `urn:li:person:${userInfo.sub}`;

  // 2) Publicar el artículo
  const response = await linkedin.postArticle(authorUrn, text, articleUrl, articleTitle, articleDescription);

  const result: PostResult = {
    ok: true,
    platform: 'linkedin',
    id: response.id,
    status: 'published',
  };

  return result;
};
