import { HttpParseError, HttpRequestError, HttpTimeoutError } from './errors';

/** Crea un error de solicitud HTTP con status, método, url y cuerpo adjuntos */
export function createHttpRequestError(
  url: string,
  method: string,
  status: number,
  statusText: string,
  body?: any,
) {
  return new HttpRequestError(status, statusText, url, method, body);
}

/** Crea un error de timeout con datos de contexto */
export function createHttpTimeoutError(url: string, timeoutMs: number) {
  return new HttpTimeoutError(url, timeoutMs);
}

/** Crea un error de parseo cuando la respuesta no es JSON válido */
export function createHttpParseError(url: string, method: string, raw: string) {
  return new HttpParseError(url, method, raw);
}

