import { Injectable } from '@nestjs/common';
import { LinkedInPostArticleDto } from './dto/post-article.dto';
import { LinkedInClient } from './clients/linkedin.client';
import { PostResult } from './use-cases/publish/shared/types';
import { postLinkedInArticleUseCase } from './use-cases/publish/post-article.use-case';

@Injectable()
export class LinkedinService {
  constructor(private readonly linkedin: LinkedInClient) {}

  /**
   * Publica un artículo en LinkedIn
   * @param dto - Datos del artículo (texto, URL, título, descripción)
   * @returns Resultado con el ID del post publicado
   */
  async postArticle(linkedinPostArticleDto: LinkedInPostArticleDto): Promise<PostResult> {
    return await postLinkedInArticleUseCase(this.linkedin, linkedinPostArticleDto);
  }
}
