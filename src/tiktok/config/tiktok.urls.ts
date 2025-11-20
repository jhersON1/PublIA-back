/** Base URL para autenticación OAuth de TikTok */
export const TIKTOK_AUTH_BASE_URL = 'https://www.tiktok.com/v2/auth/authorize/';

/** Base URL para API de TikTok (tokens, etc.) */
export const TIKTOK_API_BASE_URL = 'https://open.tiktokapis.com/v2';

/** Endpoint para intercambio de código por token */
export const TIKTOK_TOKEN_URL = `${TIKTOK_API_BASE_URL}/oauth/token/`;

/** Scopes por defecto para OAuth */
export const DEFAULT_TIKTOK_SCOPES = 'user.info.basic';

/** Endpoint para inicializar subida de video */
export const TIKTOK_VIDEO_INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/';

/** Bearer token para autenticación de API (configurar en .env) */
export const TIKTOK_BEARER_TOKEN = process.env.TIKTOK_BEARER_TOKEN || '';
