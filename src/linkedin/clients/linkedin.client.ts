import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../../http/http.service';
import { LinkedInException } from '../exceptions/linkedin.exceptions';
import { LINKEDIN_USER_INFO_URL, LINKEDIN_UGC_POSTS_URL } from '../config/linkedin.urls';

interface UserInfoResponse {
  sub: string;
  email_verified: boolean;
  name: string;
  locale: {
    country: string;
    language: string;
  };
  given_name: string;
  family_name: string;
  email: string;
}

interface UGCPostRequest {
  author: string;
  lifecycleState: 'PUBLISHED';
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string;
      };
      shareMediaCategory: 'ARTICLE';
      media: Array<{
        status: 'READY';
        description?: {
          text: string;
        };
        originalUrl: string;
        title: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC';
  };
}

interface UGCPostResponse {
  id: string;
}

@Injectable()
export class LinkedInClient {
  private readonly accessToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {
    this.accessToken = this.config.get<string>('LINKEDIN_ACCESS_TOKEN') || '';
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.accessToken) LinkedInException.missingEnv('LINKEDIN_ACCESS_TOKEN');
  }

  /**
   * Obtiene la información del usuario autenticado desde LinkedIn
   * @returns Información del usuario, incluyendo el sub (user ID)
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      return await this.http.get<UserInfoResponse>(LINKEDIN_USER_INFO_URL, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (e: any) {
      LinkedInException.apiError('LinkedIn API error (get user info)', e.body || e.message, e.status);
    }
  }

  /**
   * Publica un artículo en LinkedIn como UGC Post
   * @param authorUrn - URN del autor (ej: "urn:li:person:AhYu7CvYkR")
   * @param text - Texto del comentario del post
   * @param articleUrl - URL del artículo a compartir
   * @param articleTitle - Título del artículo
   * @param articleDescription - Descripción del artículo (opcional)
   * @returns Respuesta con el ID del post creado
   */
  async postArticle(
    authorUrn: string,
    text: string,
    articleUrl: string,
    articleTitle: string,
    articleDescription?: string,
  ): Promise<UGCPostResponse> {
    const body: UGCPostRequest = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text,
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              ...(articleDescription && {
                description: {
                  text: articleDescription,
                },
              }),
              originalUrl: articleUrl,
              title: {
                text: articleTitle,
              },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    try {
      return await this.http.postJson<UGCPostResponse>(LINKEDIN_UGC_POSTS_URL, body, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
    } catch (e: any) {
      LinkedInException.apiError('LinkedIn API error (post article)', e.body || e.message, e.status);
    }
  }
}
