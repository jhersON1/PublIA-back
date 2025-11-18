import { ConfigService } from '@nestjs/config';

export const DEFAULT_META_GRAPH_VERSION = 'v24.0';

export function getMetaGraphVersion(config: ConfigService): string {
  return config.get<string>('META_GRAPH_VERSION') || DEFAULT_META_GRAPH_VERSION;
}

export function buildMetaGraphBaseUrl(version: string): string {
  return `https://graph.facebook.com/${version}`;
}

export function getMetaGraphBaseUrl(config: ConfigService): string {
  return buildMetaGraphBaseUrl(getMetaGraphVersion(config));
}

// Facebook URLs
export function getFacebookPageFeedUrl(baseUrl: string, pageId: string): string {
  return `${baseUrl}/${encodeURIComponent(pageId)}/feed`;
}

export function getFacebookPermalinkUrl(baseUrl: string, postId: string, accessToken: string): string {
  return `${baseUrl}/${encodeURIComponent(postId)}?fields=permalink_url&access_token=${encodeURIComponent(accessToken)}`;
}

// Instagram URLs
export function getInstagramMediaUrl(baseUrl: string, igUserId: string): string {
  return `${baseUrl}/${encodeURIComponent(igUserId)}/media`;
}

export function getInstagramMediaPublishUrl(baseUrl: string, igUserId: string): string {
  return `${baseUrl}/${encodeURIComponent(igUserId)}/media_publish`;
}

export function getInstagramPermalinkUrl(baseUrl: string, mediaId: string, accessToken: string): string {
  return `${baseUrl}/${encodeURIComponent(mediaId)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`;
}

// WhatsApp URLs
export function getWhatsAppMessagesUrl(baseUrl: string, phoneNumberId: string): string {
  return `${baseUrl}/${phoneNumberId}/messages`;
}

// Meta Graph URLs
export function getMetaAccountsUrl(baseUrl: string, accessToken: string): string {
  const fields = 'id,name,access_token,instagram_business_account';
  return `${baseUrl}/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
}

