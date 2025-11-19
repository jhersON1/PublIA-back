import { Injectable } from '@nestjs/common';
import { createHttpParseError, createHttpRequestError, createHttpTimeoutError } from './errors/handler';

export interface RequestOptions extends RequestInit {
  /** Tiempo máximo de espera en milisegundos (por defecto 15000 ms) */
  timeoutMs?: number;
  /** Tipo de respuesta esperada (por defecto 'json' si es application/json, o 'text') */
  responseType?: 'json' | 'text' | 'arraybuffer';
}

@Injectable()
export class HttpService {
  /**
   * Realiza una petición HTTP usando fetch con soporte de timeout y
   * parseo automático de JSON cuando el content-type es application/json.
   * Si la respuesta no es 2xx, lanza un Error con `status` y `body` adjuntos.
   */
  async request<T = unknown>(input: string | URL | Request, init?: RequestOptions): Promise<T> {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';
    const controller = new AbortController();
    const timeoutMs = init?.timeoutMs ?? 15000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(input, { ...init, signal: controller.signal });

      if (!res.ok) {
        // Intentar leer el error como texto o JSON
        let errorBody: any;
        try {
          const errorText = await res.text();
          try {
            errorBody = JSON.parse(errorText);
          } catch {
            errorBody = errorText;
          }
        } catch {
          errorBody = 'Unknown error';
        }
        throw createHttpRequestError(url, method, res.status, res.statusText, errorBody);
      }

      if (init?.responseType === 'arraybuffer') {
        return (await res.arrayBuffer()) as unknown as T;
      }

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (init?.responseType === 'text') {
        return (await res.text()) as unknown as T;
      }

      const raw = await res.text();
      let body: any = raw;

      if (isJson && raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          throw createHttpParseError(url, method, raw);
        }
      }

      return body as T;
    } catch (e: any) {

      if (e?.name === 'AbortError') {
        throw createHttpTimeoutError(url, timeoutMs);
      }

      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Realiza un GET y devuelve el cuerpo parseado (JSON si aplica).
   */
  get<T = unknown>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Realiza un POST enviando JSON en el cuerpo y devuelve el cuerpo parseado.
   */
  postJson<T = unknown>(
    url: string,
    data: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T> {
    const headers = { 'Content-Type': 'application/json', ...(options?.headers || {}) } as Record<string, string>;

    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers,
      body: JSON.stringify(data ?? {}),
    });
  }

  /**
   * Realiza un POST enviando x-www-form-urlencoded y devuelve el cuerpo parseado.
   */
  postForm<T = unknown>(
    url: string,
    form: Record<string, string>,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ): Promise<T> {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', ...(options?.headers || {}) } as Record<
      string,
      string
    >;
    const body = new URLSearchParams(form).toString();
    return this.request<T>(url, { ...options, method: 'POST', headers, body });
  }
}
