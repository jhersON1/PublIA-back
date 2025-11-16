import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpClient {
  async request<T = any>(
    input: string | URL | Request,
    init?: RequestInit & { timeoutMs?: number },
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? 15000);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      const text = await res.text();
      const isJson = (res.headers.get('content-type') || '').includes('application/json');
      const body = isJson ? (text ? JSON.parse(text) : undefined) : (text as any);
      if (!res.ok) {
        const err: any = new Error(`HTTP ${res.status} ${res.statusText}`);
        err.status = res.status;
        err.body = body;
        throw err;
      }
      return body as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

