import { FacebookClient } from '../../../clients/facebook.client';
import { PostResult } from '../shared/types';
import { MetaException } from '../../../exceptions/meta.exceptions';

interface Options {
  pageId: string;
  accessToken: string;
  message: string;
}

export const postFacebookTextUseCase = async (
  facebook: FacebookClient,
  { pageId, accessToken, message }: Options,
): Promise<PostResult> => {
  if (!message || !message.trim()) {
    MetaException.validation('Facebook text message is required');
  }

  const created = await facebook.postPageFeedMessage(pageId, accessToken, message.trim());

  // Fetch permalink (best-effort)
  let permalink: string | undefined;
  try {
    const meta = await facebook.getPermalink(created.id, accessToken);
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
