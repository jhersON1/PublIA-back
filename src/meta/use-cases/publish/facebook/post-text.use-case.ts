import { FacebookClient } from '../../../clients/facebook.client';
import { PostResult } from '../shared/types';

interface Options {
  pageId: string;
  accessToken: string;
  message: string;
}

export const postFacebookTextUseCase = async (
  facebook: FacebookClient,
  { pageId, accessToken, message }: Options,
): Promise<PostResult> => {
  const created = await facebook.postPageFeedMessage({ pageId, accessToken, message });

  // Fetch permalink (best-effort)
  let permalink: string | undefined;
  try {
    const meta = await facebook.getPermalink({ postId: created.id, accessToken });
    permalink = meta?.permalink_url;
  } catch {
    // ignore permalink failures
  }

  const result: PostResult = {
    ok: true,
    platform: 'facebook',
    id: created.id,
    permalink,
    status: 'published',
  };
  return result;
};
