import { ConfigService } from '@nestjs/config';

/** Versión por defecto del Graph API si no está definida en .env */
export const DEFAULT_META_GRAPH_VERSION = 'v19.0';

/** Devuelve la versión de Graph definida en .env o la predeterminada */
export function getMetaGraphVersion(config: ConfigService): string {
  return config.get<string>('META_GRAPH_VERSION') || DEFAULT_META_GRAPH_VERSION;
}

/** Construye la base URL del Graph API en función de la versión */
export function buildMetaGraphBaseUrl(version: string): string {
  return `https://graph.facebook.com/${version}`;
}

/** Obtiene la base URL del Graph API leyendo la versión desde el ConfigService */
export function getMetaGraphBaseUrl(config: ConfigService): string {
  return buildMetaGraphBaseUrl(getMetaGraphVersion(config));
}

